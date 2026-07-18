import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { FirebaseStrategy } from './firebase.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CompositeAuthGuard } from './composite-auth.guard';

@Module({
  imports: [
    ConfigModule,
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
  providers: [
    FirebaseStrategy,
    JwtStrategy,
    FirebaseAuthGuard,
    JwtAuthGuard,
    CompositeAuthGuard,
  ],
  exports: [
    JwtModule,
    JwtStrategy,
    JwtAuthGuard,
    CompositeAuthGuard,
    FirebaseAuthGuard,
    PassportModule,
  ],
})
export class AuthModule {}