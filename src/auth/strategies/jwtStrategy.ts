import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PayloadToken } from '../models/tokenModel';
import config from './../../config';

@Injectable()
export class jwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(@Inject(config.KEY) configService: ConfigType<typeof config>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken, // de donde lo debe tomar
      ignoreExpiration: false, // no debe ignorar la expiracion
      secretOrKey: 'EASY_KEY',
    });

    console.log('al menos instanciado');
  }

  validate(payload: PayloadToken): PayloadToken {
    console.log('EL PAYLOAD', payload);
    return payload;
  }
}

// Basicamente la desencriptacion del token se hace en constructor y el metodo validate solo retorna
// lo que recivio desencriptado
