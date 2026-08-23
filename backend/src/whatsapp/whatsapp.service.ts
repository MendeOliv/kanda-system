import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);
  private readonly whatsappApiUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.whatsappApiUrl = this.configService.get<string>('WHATSAPP_API_URL') || 'http://localhost:3002';
  }

  /**
   * Convert phone number to WhatsApp JID format
   * Removes non-digits and @s.whatsapp.net suffix if not present
   */
  private toWhatsAppJid(phoneNumber: string): string {
    const cleaned = phoneNumber.trim();
    this.logger.log(`toWhatsAppJid input: '${phoneNumber}' -> cleaned: '${cleaned}'`);

    if (/^\\d+@s\\.whatsapp\\.net$/.test(cleaned)) {
      this.logger.log(`toWhatsAppJid matched regex, returning: '${cleaned}'`);
      return cleaned;
    }

    // Extract only digits, removing all non-digit characters (including +, -, spaces, etc.)
    const digits = cleaned.replace(/[^0-9]/g, '');
    this.logger.log(`toWhatsAppJid digits extracted: '${digits}'`);

    if (!digits) {
      throw new Error('Invalid WhatsApp phone number');
    }

    const result = `${digits}@s.whatsapp.net`;
    this.logger.log(`toWhatsAppJid result: '${result}'`);
    return result;
  }

  async sendMessage(to: string, text: string): Promise<void> {
    const jid = this.toWhatsAppJid(to);
    this.logger.log(`Backend normalized JID: ${jid}`);
    this.logger.log(`Sending WhatsApp message to ${jid}: ${text.substring(0, 50)}...`);

    try {
      await firstValueFrom(
        this.httpService.post(`${this.whatsappApiUrl}/send-message`, { to: jid, text }).pipe(
          catchError((error) => {
            this.logger.error(`Failed to send WhatsApp message to ${jid}:`, error.response?.data || error.message);
            throw error;
          }),
        ),
      );
      this.logger.log(`WhatsApp message sent successfully to ${jid}`);
    } catch (error) {
      this.logger.error(`Error in WhatsApp service sendMessage:`, error);
      throw error;
    }
  }
}