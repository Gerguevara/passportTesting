# installacion 
`la estrategia local es la por defecto`
$ npm install --save @nestjs/passport passport passport-local
$ npm install --save-dev @types/passport-local

Cabe aclarar que lo que passport ase basicamente es crear la logica autenticacion
para un middleware y pegar el resultado en el request implementando sus estrategias.

Primeraremente se aplica el basicStrategy que simplemente es la validacion de datos usario password 
en una base de datos. funcionad de la siguiente manera.

Primerop creamos un servicio el cuantendra esta logica de recibir el usuario bucarlo y validar el password , previamente ya existe un servicio llamdo user service tambien el cual contiene el metdo de findByEmail que este servicio auth utiliza
`Recordar que para que funcione el modulo user dene estar inportado en authModule`

# AuthService.get

import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/services/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService) {} //👈  servicio previamente creado

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    let isMatch = false;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    }
    if (user && isMatch) {
      return user;
    }
    return null;
  }
}

`Luego creamos nuestra propia strategia, que no es mas que un servicio extendiendo`
`de una clase de passpordJS`

# localStrategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

//Custon service
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') { //👈 extiende
  constructor(public authService: AuthService) { //👈 inyecta el servicio anterior
    super();    
  }

  async validate(email: string, password: string) {

    const user = await this.authService.validateUser(email, password); //👈 usa el servicio
    console.log(user);

    if (!user) {
      throw new UnauthorizedException('Bad Credentials'); //👈 arroja menaje de error y corta el flujo
    }

    return user; //👈  si todo es correcto retorna el usuario
  }
}

`asy mismo es necesario pasar la configuracion dle modulo he importar los servicio y otros modulos`

# authModule.ts

@Module({
  imports: [UsersModule, PassportModule], //👈 necesita passport
  controllers: [AuthController],
  providers: [ApiKeyGuard, LocalStrategy, AuthService],  //👈 las strategy son servicio van a providers
})
export class AuthModule {}


y finalmente se utiliza en el controlador que maneja el login de la siguiente forma, aplicandolo como un guard

import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('auth')
export class AuthController {  

  @UseGuards(AuthGuard('local'))  //👈 se le indica que  use como guard uno de passport y se le dice que estrategia
  @Post('login')
  login(@Req() req: Request) { //👈 en el reques est pegado el usuario si este es encontrado en el guard
    return req.user;
  }
}

===================================================================================================
# Aplicando JWT

# Instalacion

npm install --save @nestjs/jwt passport-jwt
npm install --save-dev @types/passport-jwt

configurando en el modulo 
# authModule.ts
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: 'ESTO_DEVERIA_IR_EN_VARIABLES_DE_ENTORNO', //👈 aqui se coloca la configurasion
      signOptions: {
        expiresIn: '10d',
      },
    }),
  ],
  controllers: [AuthController],
  providers: [ApiKeyGuard, LocalStrategy, AuthService],
  exports: [ApiKeyGuard],
})
export class AuthModule {}

`Asi tambien se puede crear de forma asincrona con el registerAsync que permite inyectar valores`
# authModule.ts
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

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [config.KEY],
      useFactory: (configService: ConfigType<typeof config>) => {
        return {
          secret: configService.jwtSecret,
          signOptions: {
            expiresIn: '10d',
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [ApiKeyGuard, LocalStrategy, AuthService],
  exports: [ApiKeyGuard],
})
export class AuthModule {}


` luego en authService.ts creamos el metodo que ahce la encriptacion del token`
# auth.service.ts
  generateJWT(user: User) {
    const payload: PayloadToken = { role: user.role, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  `opcionamente creamos una interfaz para dar tipado a a la respuesta llamada PayloadToken`

export interface PayloadToken {
  role: string;
  sub: number;
}
 

 `Finalmente utilizamos este metodo en nuestro enpoind de logi`

 # authController.ts
import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from '../services/auth.service';

@Controller('auth')
export class AuthController {
  // basicamente utiliza el guar de midelguard el cual extrae el usuario
  // y su este es correcto lo devuelve
  constructor(private authService: AuthService) {} //👈 inyectamos el servicio

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    const user = req.user as User;
    return this.authService.generateJWT(user); //👈 usamos el metodo
  }
}
============================================================================================================
# Aplicando JWT Guard (nueva strategy)

`para ellos devemos crear una nueva estrategia de esta forma `

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
      secretOrKey: configService.jwtSecret,
    });
  }

  validate(payload: PayloadToken): PayloadToken {
    return payload;
  }
}

`basicamente las desencriptacion ocurre en el contructor y el metodo validate es lo que pega`
`en el request lo que le pasa por parametro`

- no olvidar ponerlo en el modulo

  providers: [ApiKeyGuard, LocalStrategy, jwtStrategy, AuthService], //👈 poner en el modulo


  # implementando el guard
  para implmenetar el guard debemos decir en cada controler que utilice este guard en

  # products.controller.ts

{ UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt')) //👈 indicamos que este enpoint esta protegido
@ApiTags('products')
@Controller('products')
export class ProductsController {...}