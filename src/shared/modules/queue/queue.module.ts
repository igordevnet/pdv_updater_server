import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";

@Module({
    imports: [
        BullModule.registerQueue({ name: 'google_sheets' })
    ],
    exports: [BullModule],
    providers: [],

})
export class QueueModule {}