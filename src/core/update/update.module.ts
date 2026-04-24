import { Module } from "@nestjs/common";
import { UpdateController } from "./update.controller";
import { UpdateService } from "./update.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Update, UpdateSchema } from "./entities/update.entity";
import { UpdateRepository } from "./repositories/update.repository";
import { QueueModule } from "src/shared/modules/queue/queue.module";
import { QueueProcessor } from "../../shared/modules/queue/queue.worker";
import { GoogleSheetsModule } from "../../shared/modules/google/google-sheets.module";

@Module({
    imports: [
        MongooseModule.forFeature([{
        name: Update.name, schema: UpdateSchema
    }]),
        QueueModule,
        GoogleSheetsModule
    ],
    controllers: [UpdateController],
    providers: [
        UpdateService,
        UpdateRepository,
        QueueProcessor
    ],
    exports: [],
})
export class UpdateModule { }