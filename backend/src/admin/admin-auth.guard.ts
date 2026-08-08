import { Injectable, CanActivate, ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    if (!user) {
      throw new UnauthorizedException('Não autenticado');
    }
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Acesso negado. Apenas administradores.');
    }
    return true;
  }
}