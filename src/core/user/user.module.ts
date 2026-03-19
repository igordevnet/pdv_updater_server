import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./entities/user.entity";
import { UserRepository } from "./repositories/user.repository";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { SecurityModule } from "src/shared/modules/security/security.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: User.name, schema: UserSchema },
        ]),
        SecurityModule
    ],
    controllers: [UserController],
    providers: [
        UserService,
        UserRepository,
    ],
    exports: [
        UserService,
    ],
})
export class UserModule {}