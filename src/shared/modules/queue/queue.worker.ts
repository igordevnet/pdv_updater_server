import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { GoogleSheetsService } from "../google/google-sheets.service";
import { Logger } from "@nestjs/common";

@Processor('google_sheets')
export class QueueProcessor extends WorkerHost {

    public constructor(
        private readonly googleService: GoogleSheetsService
    ) {
        super();
    }

    private readonly logger = new Logger(QueueProcessor.name);

    async process(job: Job): Promise<any> {

        await this.googleService.updatePdvVersion(job.data);

        this.logger.log(`Processing job with id ${job.id} and data ${JSON.stringify(job.data)}`);
    }
}
