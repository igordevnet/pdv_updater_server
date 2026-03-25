import { Inject, Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import winVersionInfo from 'win-version-info';
import { DownloadFileDTO } from './dtos/download-file.dto';
import { UpdateRepository } from './repositories/update.repository';
import { GoogleSheetsService } from '../../shared/modules/google/google-sheets.service';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';


@Injectable()
export class UpdateService {

    private readonly filePath;

    public constructor(
        private readonly updateRepository: UpdateRepository, 
        private readonly googleSheetsService: GoogleSheetsService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        this.filePath = join(process.cwd(), 'files', 'PdvFX.exe');
    }

    public async getLastestVersionFile() {
        const cacheKey = 'version_file';

        const cachedVersion = await this.cacheManager.get<string>(cacheKey);
        if(cachedVersion) {
            return cachedVersion;
        }

        const info = await winVersionInfo(this.filePath);
        await this.cacheManager.set(cacheKey, info.FileVersion, 300000);

        return info.FileVersion;  
    }

    public async getLastestFile(dto: DownloadFileDTO, deviceName: string) {

        const fileStream = createReadStream(this.filePath);

        this.saveAndExport(dto, deviceName);

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