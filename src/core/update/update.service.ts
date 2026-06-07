import { Inject, Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { createReadStream, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import winVersionInfo from 'win-version-info';
import { SaveUpdateDTO } from './dtos/save-update.dto';
import { UpdateRepository } from './repositories/update.repository';
import type { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ExeType } from '../../shared/enums/exe.enum';
import { ForceData } from 'src/shared/interfaces/force-data';
import { CheckDTO } from './dtos/check.dto';


@Injectable()
export class UpdateService {

    private readonly folderPath;
    private readonly dotmartFile;
    private readonly posFile;
    private readonly forceJson;

    public constructor(
        private readonly updateRepository: UpdateRepository,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        @InjectQueue('google_sheets') private readonly googleQueue: Queue
    ) {
        this.folderPath = this.configService.get<string>('FOLDER_PATH');
        this.dotmartFile = this.configService.get<string>('DOTMART_FILE');
        this.posFile = this.configService.get<string>('POS_FILE');
        this.forceJson = this.configService.get<string>('FORCE_JSON');
    }

    public async getFileVersion(cnpj: string, exeType: ExeType): Promise<CheckDTO> {
        const forceUpdate = this.forceUpdate(cnpj);

        if (forceUpdate && exeType === forceUpdate.exeType) {
            return {
                force: forceUpdate.force,
                cnpj: forceUpdate.cnpj,
                exeType: forceUpdate.exeType,
                version: forceUpdate.version
            }
        }

        const cacheKey = `version_file_${cnpj}_${exeType}`;

        const cachedVersion = await this.cacheManager.get<string>(cacheKey);
        if (cachedVersion) {
            return {
                version: cachedVersion,
            };
        }

        const filePath = this.getUrl(cnpj, exeType);

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

    public async getLastestFile(cnpj: string, exeType: ExeType) {

        const filePath = this.getUrl(cnpj, exeType);

        if (!existsSync(filePath)) {
            throw new NotFoundException(`File not found for Cnpj: ${cnpj}`);
        }

        const fileStream = createReadStream(filePath);

        return new StreamableFile(fileStream, {
            type: 'application/octet-stream',
            disposition: `attachment; filename="${exeType}.exe"`,
        });
    }

    public async saveAndExport(dto: SaveUpdateDTO, deviceName: string, exeType: ExeType) {
        const payload = {
            userId: dto.userId,
            deviceId: dto.deviceId,
            exeVersion: dto.version,
            exeType: exeType
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
            version: dto.version,
            cnpj: dto.cnpj,
            exeType: exeType
        };

        try {

            this.googleQueue.add('process', payloadSheet).catch(err => {
                console.error("Error trying to add the job into the queue:", err.message);
            });
        } catch (e) {
            console.error("Redis error:", e);
        }
    }

    private forceUpdate(cnpj: string): ForceData | null {
        const url = join(this.folderPath, cnpj, this.forceJson);

        if (!existsSync(url)) {
            return null;
        }

        try {
            const fileContent = readFileSync(url, "utf-8");
            return JSON.parse(fileContent);
        } catch {
            return null;
        }
    }

    private getUrl(cnpj: string, exeType: ExeType): string {
        if (!this.folderPath) throw new Error('Invalid Folder env variable')
        if (!this.dotmartFile) throw new Error('Invalid Dotmart file env variable')
        if (!this.posFile) throw new Error('Invalid Pos file env variable')

        switch (exeType) {
            case ExeType.DOTMAT:
                return join(this.folderPath, cnpj, this.dotmartFile);

            case ExeType.PDV:
                return join(this.folderPath, cnpj, this.posFile);
            default:
                throw new Error(`Invalid exe type: ${exeType}`);
        }
    }
}