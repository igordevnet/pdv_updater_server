import { Module } from "@nestjs/common";
import { UpdateController } from "./update.controller";
import { UpdateService } from "./update.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Update, UpdateSchema } from "./entities/update.entity";

@Module({
    imports: [MongooseModule.forFeature([{
        name: Update.name, schema: UpdateSchema
    }])],
    controllers: [UpdateController],
    providers: [UpdateService],
    exports: [],
})
export class UpdateModule { }