import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

//Custon service
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(public authService: AuthService) {
    super();
    // super({
    //   userNameField: 'email', //opcional para renombrar  le parameto de username a password
    // passwordField
    // });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Bad Credentials');
    }

    return user;
  }
}
