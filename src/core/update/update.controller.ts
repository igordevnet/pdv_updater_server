import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { UpdateService } from './update.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/shared/decorators/current-user.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation,  ApiResponse, ApiTags } from '@nestjs/swagger';
import { Version } from 'src/shared/types/version-response.type';
import { NotifyDownloadDto } from './dtos/notify-download.dto';


@ApiTags('Update')
@Controller('/updates')
export class UpdateController {

    constructor(private readonly updateService: UpdateService) { }

    @Get('/check')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Returns the version of the executable POS file' })
    @ApiResponse({ status: 200, description: 'Version sent successfully' })
    @ApiResponse({ status: 401, description: 'Please, log in again' })
    @ApiResponse({ status: 404, description: 'File not found' })
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    public checkVersion(): Promise<Version> {
        return this.updateService.getLastestVersionFile()
    };

    @Get('/download')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Download the latest POS executable' })
    @ApiResponse({ status: 200, description: 'File sent successfully' })
    @ApiResponse({ status: 401, description: 'Please, log in again' })
    @ApiResponse({ status: 404, description: 'File not found' })
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    public downloadFile() {
        return this.updateService.getLastestFile();
    };

    @Post('/save')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Authenticate a user and save the last version the device downloaded' })
    @ApiResponse({ status: 200, description: 'Ok' })
    @ApiResponse({ status: 401, description: 'Please, log in again' })
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard('jwt'))
    public notifyDownloadComplete(@CurrentUser() user, @Body() dto: NotifyDownloadDto) {
        const sheetDto = {
            userId: user.sub,
            deviceId: user.device,
            name: user.name,
        }
        return this.updateService.saveAndExport(sheetDto, dto.deviceName);
    };
}
