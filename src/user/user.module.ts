import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
    imports: [TypeOrmModule.forFeature([User, Role])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService], // export so other modules can inject it
})
export class UserModule {}
