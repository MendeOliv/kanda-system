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
   * Convert phone number or JID to WhatsApp JID format
   * If the identifier already contains '@', it is assumed to be a valid JID and returned as is.
   * Otherwise, it is treated as a phone number and converted to the format: [digits]@s.whatsapp.net
   */
  private toWhatsAppJid(identifier: string): string {
    // If it's already a JID (contains '@'), return as is.
    if (identifier.includes('@')) {
      this.logger.log(`toWhatsAppJid identifier is already a JID: '${identifier}'`);
      return identifier;
    }

    // Otherwise, treat as phone number and convert to JID for a user.
    const cleaned = identifier.trim();
    this.logger.log(`toWhatsAppJid input: '${identifier}' -> cleaned: '${cleaned}'`);

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