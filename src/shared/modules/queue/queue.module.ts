import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { GoogleSheetsModule } from "../google/google-sheets.module";

@Module({
    imports: [
        BullModule.registerQueue({ name: 'google_sheets' }),
        GoogleSheetsModule
    ],
    exports: [BullModule],
    providers: [],

})
export class QueueModule {}