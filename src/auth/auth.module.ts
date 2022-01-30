import { Module } from '@nestjs/common';
import { ApiKeyGuard } from './guards/apikey.guard';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/localStrategy';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { ConfigType } from '@nestjs/config';
import config from './../config';
import { jwtStrategy } from './strategies/jwtStrategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        return {
          secret: 'EASY_KEY',
          signOptions: {
            expiresIn: '10d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [ApiKeyGuard, LocalStrategy, jwtStrategy, AuthService],
  exports: [ApiKeyGuard],
})
export class AuthModule {}
