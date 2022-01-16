# Guards NestJS

- generar un guar
`nest g gu name`

por defecto los guards implmentan un metodo llamado canActivate que puede retortar un boleano
una promesa o observable booleana tambien si true permite el paso soguiente, si no no permite
el acceso a la ruta.

# apiKey.guard.ts
  import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest<Request>();  //👈 toma del request
    const authHeader = request.header('Auth');
    const isAuth = authHeader === '1234';
    if (!isAuth) {
      throw new UnauthorizedException('not allow');
    }
    return true;
  }
}

`Y para utilizarse`
 @UseGuards(ApiKeyGuard) //👈  usa este decorador
  @Get('nuevo')
  newEndpoint() {
    return 'yo soy nuevo';
  }

`Asi mismo este decorador se puede utilizar directo en la clase controller y la protege`
=============================================================================================
`En caso de aplicar un decorador a toda la clase pero queremos excluir uno de nuestros endpoind`

-importamos `setMetadata` de NestCommons.

 @Get('nuevo')
  @SetMetadata('isPublic', true)  //👈  usa este decorador
  newEndpoint() {
    return 'yo soy nuevo';
  }

  luego en el mismo guard podemos tomar esa metadata, para ello utilizamos la clase
  Reflecto de nestjscore y luego valalidamos esa metada


# apiKey.guard.ts
import { Reflector } from '@nestjs/core'; //👈  importamos

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private reflector: Reflector) {}  //👈  inyectamos en el constructor

  canActivate(    context: ExecutionContex...  ): boolean {
    const isPublic = this.reflector.get('isPublic', context.getHandler());//👈  obtenemos metadata 
    if (isPublic) {
      return true;
    }
   ...
    return true;
  }
}
===========================================================================================
# Creando Nuestros propios Decoradores
Aprovechando el setMEtadata podemos crear nuestro propio decorador
`nest g d name`, los decoradores implementan por defecto la metada

y se le agrega el siguiente codigo 

import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

`Public es el nombre del decorador que va antes en el arroy function`

y para utilizar simplemente

 @Get('nuevo')
  @Public() //👈 usamos el decorador
  newEndpoint() {
    return 'yo soy nuevo';
  }