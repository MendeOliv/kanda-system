import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface PaymentRequest {
  orderId: string;
  amount: number;
  customerName: string;
  customerPhone: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentUrl: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
}

@Injectable()
export class AppyPayProvider {
  private readonly logger = new Logger(AppyPayProvider.name);
  private readonly apiKey: string | undefined;
  private readonly baseUrl: string;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('APPYPAY_API_KEY');
    this.baseUrl = this.configService.get<string>('APPYPAY_BASE_URL', 'https://api.appypay.com/v1');
    
    if (this.apiKey) {
      this.logger.log('AppyPay Provider initialized');
    }
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    if (!this.isConfigured) {
      this.logger.warn('AppyPay not configured, returning mock payment');
      return {
        paymentId: `mock_${request.orderId}`,
        paymentUrl: `https://appypay.com/pay/mock_${request.orderId}`,
        status: 'PENDING',
      };
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.baseUrl}/checkout`,
          {
            external_id: request.orderId,
            amount: request.amount,
            customer: {
              name: request.customerName,
              phone: request.customerPhone,
            },
            callback_url: `${this.configService.get('API_URL')}/api/v1/payments/webhook`,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
            },
          },
        ),
      );

      return {
        paymentId: response.data.id,
        paymentUrl: response.data.payment_url,
        status: 'PENDING',
      };
    } catch (error) {
      this.logger.error(`AppyPay Error: ${error.message}`);
      throw new Error('Failed to create payment link');
    }
  }
}
