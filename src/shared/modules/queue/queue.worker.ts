import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { GoogleSheetsService } from "../google/google-sheets.service";

@Processor('google_sheets')
export class QueueProcessor extends WorkerHost {

    public constructor(
        private readonly googleService: GoogleSheetsService
    ) {
        super();
    }

    async process(job: Job): Promise<any> {
        
        this.googleService.updatePdvVersion(job.data);
    }
}
