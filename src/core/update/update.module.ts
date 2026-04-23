import { Module } from "@nestjs/common";
import { UpdateController } from "./update.controller";
import { UpdateService } from "./update.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Update, UpdateSchema } from "./entities/update.entity";
import { UpdateRepository } from "./repositories/update.repository";
import { BullModule } from "@nestjs/bullmq";
import { QueueModule } from "src/shared/modules/queue/queue.module";

@Module({
    imports: [
        MongooseModule.forFeature([{
        name: Update.name, schema: UpdateSchema
    }]),
        QueueModule
    ],
    controllers: [UpdateController],
    providers: [
        UpdateService,
        UpdateRepository,
    ],
    exports: [],
})
export class UpdateModule { }