import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';
import winVersionInfo from 'win-version-info';


@Injectable()
export class UpdateService {

    private readonly filePath; 

    public constructor() {
        this.filePath = join(process.cwd(), 'files', 'pdv.exe');
    }

    public getLastestVersionFile() {

        const info = winVersionInfo(this.filePath);
        return info.FileVersion;  
    }


    public getLastestFile(): StreamableFile {

        const fileStream = createReadStream(this.filePath);

        return new StreamableFile(fileStream, {
            type: 'application/octet-stream',
            disposition: 'attachment; filename="pdv.exe"',
        });
    }
}
