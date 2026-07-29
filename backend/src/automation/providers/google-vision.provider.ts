import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleVisionProvider {
  private readonly logger = new Logger(GoogleVisionProvider.name);
  private readonly apiKey: string | undefined;

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {
    this.apiKey = this.configService.get<string>('GOOGLE_VISION_API_KEY');
    if (this.apiKey) {
      this.logger.log('Google Vision Provider initialized');
    } else {
      this.logger.warn('GOOGLE_VISION_API_KEY not found');
    }
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  async extractText(imageUrl: string): Promise<string> {
    if (!this.isConfigured) {
      throw new Error('Google Vision Provider not configured');
    }

    const url = `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`;
    
    const body = {
      requests: [
        {
          image: {
            source: {
              imageUri: imageUrl,
            },
          },
          features: [
            {
              type: 'TEXT_DETECTION',
              maxResults: 1,
            },
          ],
        },
      ],
    };

    try {
      const response = await firstValueFrom(this.httpService.post(url, body));
      const annotations = response.data.responses[0]?.fullTextAnnotation?.text;
      
      if (!annotations) {
        this.logger.warn('No text detected in image');
        return '';
      }

      return annotations;
    } catch (error) {
      const status = error.response?.status;
      const data = error.response?.data;
      this.logger.error(`Google Vision API Error [${status}]: ${JSON.stringify(data)}`);
      throw new Error(`Failed to extract text from image: ${error.message}`);
    }
  }
}
