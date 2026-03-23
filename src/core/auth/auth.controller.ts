import { Body, Controller, Headers, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from "@nestjs/common";
import { LoginDTO } from "./dtos/login.dto";
import { AuthService } from "./auth.service";
import { Tokens } from "src/shared/types/tokens.type";
import { AuthGuard } from "@nestjs/passport";
import { CurrentUser } from "src/shared/decorators/current-user.decorator";
import { RefreshTokenDTO } from "./dtos/refresh-token.dto";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { GoogleSheetsService } from "../../shared/modules/google/google-sheets.service";
import { testDTO } from "./dtos/test.dto";

@ApiTags('Authentication')
@Controller('/auth')
export class AuthController {

    public constructor(private readonly authService: AuthService,
        private readonly googleSheetsService: GoogleSheetsService
    ) { }

    @Post('/local/signin')
    @ApiOperation({ summary: 'Authenticate a user and generate access and refresh tokens' })
    @ApiResponse({ status: 200, description: 'Tokens generated successfully' })
    @ApiResponse({ status: 401, description: 'Invalid Credentials' })
    @HttpCode(HttpStatus.OK)
    public login(@Body() dto: LoginDTO): Promise<Tokens> {
        return this.authService.login(dto);
    }

    @Post('/logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout a user by invalidating the refresh token' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    @ApiResponse({ status: 401, description: 'Please, log in again' })
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    public async logout(@CurrentUser() user): Promise<void> {
        const dto = {
            userId: user.sub,
            deviceId: user.device
        }

        await this.authService.logout(dto);
    }

    @Post('/refresh')
    @ApiOperation({ summary: 'Refresh access token using a valid refresh token' })
    @ApiResponse({ status: 200, description: 'Access token refreshed successfully' })
    @ApiResponse({ status: 401, description: 'Invalid refresh token' })
    @HttpCode(HttpStatus.OK)
    public refreshToken(@Body() dto: RefreshTokenDTO) {
        return this.authService.refreshToken(dto);
    }

    @Post('/test')
    public test(@Body() payload: testDTO) {
        console.log('Received payload:', payload);
        this.googleSheetsService.updatePdvVersion(payload);
    }
}