import { Injectable, StreamableFile } from '@nestjs/common';
import { createReadStream } from 'fs';
import { join } from 'path';


@Injectable()
export class UpdateService {

    getLastestVersionFile(){
        return {
            version: '1.0.0',
            filename: 'Pdv.exe'
        };
    }

    getLastestFile(): StreamableFile {
        const filePath = join(process.cwd(), 'files', 'pdv.exe');

        const fileStream = createReadStream(filePath);

        return new StreamableFile(fileStream, {
            type: 'application/octet-stream',
            disposition: 'attachment; filename="pdv.exe"',
        });
    }
}
