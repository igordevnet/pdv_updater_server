import { Module } from "@nestjs/common";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { UpdateModule } from "./update/update.module";

@Module({
    imports: [UserModule, AuthModule, UpdateModule],
    controllers: [],
    providers: [],
    exports: [],
})
export class CoreModule {}