import { Inject, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';
import winVersionInfo from 'win-version-info';
import { SaveUpdateDTO } from './dtos/save-update.dto';
import { UpdateRepository } from './repositories/update.repository';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Version } from 'src/shared/types/version-response.type';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';


@Injectable()
export class UpdateService {

    private readonly folderPath;

    public constructor(
        private readonly updateRepository: UpdateRepository,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @InjectQueue('google_sheets') private readonly googleQueue: Queue
    ) {
        this.folderPath = this.configService.get<string>('FOLDER_PATH');
    }

    public async getLastestVersionFile(cnpj: string): Promise<Version> {
        const cacheKey = `version_file_${cnpj}`;

        const cachedVersion = await this.cacheManager.get<string>(cacheKey);
        if (cachedVersion) {
            return {
                version: cachedVersion,
            };
        }

        const filePath = this.getUrl(cnpj);

        if (!existsSync(filePath)) {
            throw new NotFoundException(`File not found for Cnpj: ${cnpj}`);
        }

        const info = await winVersionInfo(filePath);

        if (!info.FileVersion) throw new NotFoundException('Not found');
        console.log(info.FileVersion);
        await this.cacheManager.set(cacheKey, info.FileVersion, 300000);

        return {
            version: info.FileVersion,
        };
    }

    public async getLastestFile(cnpj: string) {

        const filePath = this.getUrl(cnpj);

        if (!existsSync(filePath)) {
            throw new NotFoundException(`File not found for Cnpj: ${cnpj}`);
        }

        const fileStream = createReadStream(filePath);

        return new StreamableFile(fileStream, {
            type: 'application/octet-stream',
            disposition: 'attachment; filename="pdv.exe"',
        });
    }

    public async saveAndExport(dto: SaveUpdateDTO, deviceName: string) {
        const version = await this.getLastestVersionFile(dto.cnpj);

        const payload = {
            userId: dto.userId,
            deviceId: dto.deviceId,
            exeVersion: version.version,
        };

        const instanceCompare = await this.updateRepository.getInstanceByDevice(dto.deviceId);

        if (!instanceCompare) {
            await this.updateRepository.createInstance(payload);
        }
        else {
            await this.updateRepository.updateInstance(payload);
        }

        const payloadSheet = {
            name: dto.name,
            deviceName,
            version: version.version,
            cnpj: dto.cnpj
        };

        try {

            this.googleQueue.add('process', payloadSheet).catch(err => {
                console.error("Error trying to add the job into the queue:", err.message);
            });
        } catch (e) {
            console.error("Redis error:", e);
        }
    }

    private getUrl(cnpj: string) {
        if (!this.folderPath) throw new Error('Invalid Folder env variable')

        return join(this.folderPath, cnpj, 'PdvFX.exe');
    }
}