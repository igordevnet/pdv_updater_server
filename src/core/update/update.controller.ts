import { Controller, Get } from '@nestjs/common';
import { UpdateService } from './update.service';


@Controller('updates')
export class UpdateController {

    constructor(private readonly updateService: UpdateService) {}

    @Get('check')
    checkVersion(){
        return this.updateService.getLastestVersionFile()
    };

    @Get('download')
    downloadFile(){
        return this.updateService.getLastestFile()
    };
}
