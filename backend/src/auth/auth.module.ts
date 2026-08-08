import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FirebaseModule } from '../firebase/firebase.module';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseStrategy } from './firebase.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CompositeAuthGuard } from './composite-auth.guard';
import { N8NInternalKeyGuard } from './guards/n8n-internal-key.guard';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    ConfigModule,
    FirebaseModule,
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        const expiresIn = config.get<string>('JWT_EXPIRATION') || '86400';

        if (!secret || secret.startsWith('your-super-secret-')) {
          throw new Error(
            'JWT_SECRET is not configured. Set it in .env before starting the app.',
          );
        }

        return {
          secret,
          signOptions: { expiresIn: parseInt(expiresIn, 10) },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    FirebaseStrategy,
    JwtStrategy,
    FirebaseAuthGuard,
    JwtAuthGuard,
    CompositeAuthGuard,
    N8NInternalKeyGuard,
  ],
  exports: [
    AuthService,
    JwtModule,
    JwtStrategy,
    JwtAuthGuard,
    CompositeAuthGuard,
    FirebaseAuthGuard,
    PassportModule,
    N8NInternalKeyGuard,
  ],
})
export class AuthModule {}