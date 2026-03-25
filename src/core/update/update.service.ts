import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import winVersionInfo from 'win-version-info';
import { DownloadFileDTO } from './dtos/download-file.dto';
import { UpdateRepository } from './repositories/update.repository';
import { GoogleSheetsService } from '../../shared/modules/google/google-sheets.service';


@Injectable()
export class UpdateService {

    private readonly filePath;

    public constructor(
        private readonly updateRepository: UpdateRepository, 
        private readonly googleSheetsService: GoogleSheetsService
    ) {
        this.filePath = join(process.cwd(), 'files', 'PdvFX.exe');
    }

    public getLastestVersionFile(): string {

        const info = winVersionInfo(this.filePath);
        return info.FileVersion;  
    }

    public async getLastestFile(dto: DownloadFileDTO, deviceName: string) {

        const fileStream = await createReadStream(this.filePath);

        await this.saveAndExport(dto, deviceName)

        return new StreamableFile(fileStream, {
            type: 'application/octet-stream',
            disposition: 'attachment; filename="pdv.exe"',
        });
    }

    private async saveAndExport(dto: DownloadFileDTO, deviceName: string) {
        const version = await this.getLastestVersionFile();
        
        const payload = {
            userId: dto.userId,
            deviceId: dto.deviceId,
            exeVersion: version,
        };

        const instanceCompare = await this.updateRepository.getInstanceByDevice(dto.deviceId);

        if(!instanceCompare) {
            await this.updateRepository.createInstance(payload);
        } 
        else {
            await this.updateRepository.updateInstance(payload);
        }

        const payloadSheet = {
            name: dto.name,
            deviceName,
            version: version,
        };

        await this.googleSheetsService.updatePdvVersion(payloadSheet);
    }
}