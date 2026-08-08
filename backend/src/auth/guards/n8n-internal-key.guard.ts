import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class N8NInternalKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const expectedKey = this.configService.get<string>('N8N_INTERNAL_KEY');
    const providedKey = request.headers['x-internal-key'] || request.headers['x-internal-key'];

    if (!expectedKey) {
      // If no key is configured, allow in development (should be configured in prod)
      return true;
    }

    if (!providedKey) {
      throw new UnauthorizedException('Missing X-Internal-Key header');
    }

    // Constant-time comparison to prevent timing attacks
    const isValid = this.constantTimeEquals(providedKey, expectedKey);
    if (!isValid) {
      throw new UnauthorizedException('Invalid X-Internal-Key');
    }

    return true;
  }

  private constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}