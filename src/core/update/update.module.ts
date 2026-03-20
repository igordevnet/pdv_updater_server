import { Module } from "@nestjs/common";
import { UpdateController } from "./update.controller";
import { UpdateService } from "./update.service";

@Module({
    imports: [],
    controllers: [UpdateController],
    providers: [UpdateService],
    exports: [],
})
export class UpdateModule { }