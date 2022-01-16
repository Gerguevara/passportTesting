# Hashing Passwords

- primero isntallar bcrypi
`npm i bcrypt` y sus types `npm i @types/bcrypt`


# userService.ts

- importamos bcrypt
import * as bcrypt from 'bcrypt';

-Luego en el metodo del usuario antes de guardar tomamos el passwor y lo encriptamos y luego reasignamos
`const hashPassword = await bcrypt.hash(newUser.password, 10);`
`newUser.password = hashPassword`

 async create(data: CreateUserDto) {    
    const newUser = this.userRepo.create(data);    
    const hashPassword = await bcrypt.hash(newUser.password, 10); //👈  encriptamos
    newUser.password = hashPassword;//👈 asignamos
    if (data.customerId) {
      const customer = await this.customersService.findOne(data.customerId);
      newUser.customer = customer;
    }
    return this.userRepo.save(newUser);
  }

-tambien puede utilizarse en los entiti con `@BeoreInsert` y `BeforerUpdate`

@BeforeInsert()
@BeforeUpdate()
async hashPassword() {
  if (!this.password) return;
  const salt = await bcrypt.genSaltSync(10);
  this.password = await bcrypt.hashSync(this.password, salt);
}

- Asi mismop es bueno excluir el password desde el entity con `@Exclude`

import { Exclude } from 'class-transformer';

  @Exclude()
  @Column({ type: 'varchar', length: 255 })
  password: string; // encript