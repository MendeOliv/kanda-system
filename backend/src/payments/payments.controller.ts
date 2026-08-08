import { Controller, Post, Body, Param, Get, Headers, HttpCode, HttpStatus, UnauthorizedException, Logger } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Controller('payments')
export class PaymentsController {
  private readonly logger = new Logger(PaymentsController.name);
  private readonly webhookSecret: string | undefined;

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService,
  ) {
    this.webhookSecret = this.configService.get<string>('APPYPAY_WEBHOOK_SECRET');
  }

  @Post('order/:id')
  async createPayment(@Param('id') id: string) {
    return this.paymentsService.createPaymentForOrder(id);
  }

  /** Valida a assinatura HMAC-SHA256 do webhook AppyPay antes de processar. */
  private verifyWebhookSignature(payload: string, signatureHeader: string): boolean {
    if (!this.webhookSecret) {
      // Sandbox / dev mode — skip verification if no secret configured
      this.logger.warn('APPYPAY_WEBHOOK_SECRET not configured — skipping signature verification');
      return true;
    }

    if (!signatureHeader) {
      this.logger.warn('Webhook received without X-AppyPay-Signature header');
      return false;
    }

    const expected = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');

    // Time-safe comparison
    if (expected.length !== signatureHeader.length) return false;
    const same = crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signatureHeader),
    );
    return same;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-appypay-signature') signature: string,
  ) {
    // Strict signature validation — reject without log detail in prod
    const raw = JSON.stringify(payload);
    if (!this.verifyWebhookSignature(raw, signature)) {
      this.logger.warn('AppyPay webhook signature mismatch — rejected');
      throw new UnauthorizedException('Invalid webhook signature');
    }

    this.logger.log(`Webhook verified — order ${payload.external_id} status ${payload.status}`);
    return this.paymentsService.handleWebhook(payload);
  }
}
