import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FirebaseService } from '../firebase/firebase.service';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly firebase: FirebaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isPublic) return true;

      // Firebase não configurado — em produção, falhar; em dev, permitir bypass (não recomendado em prod)
      if (!this.firebase.isConfigured) {
        if (process.env.NODE_ENV === 'production') {
          throw new UnauthorizedException('Firebase not configured in production');
        }
        // Em desenvolvimento, permite acesso sem autenticação Firebase (não seguro)
        return true;
      }

      const request = context.switchToHttp().getRequest();
      const authHeader: string = request.headers['authorization'];
      if (!authHeader?.startsWith('Bearer ')) {
        throw new UnauthorizedException('Authentication required.');
      }

      const token = authHeader.split(' ')[1];
      try {
        const decoded = await this.firebase.verifyToken(token);
        request.user = decoded;
        return true;
      } catch {
        throw new UnauthorizedException('Invalid or expired token.');
      }
    }
}