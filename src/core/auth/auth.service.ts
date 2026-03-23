import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthRepository } from "./repositories/auth.repository";
import { LoginDTO } from "./dtos/login.dto";
import { UserService } from "../user/user.service";
import { SecurityService } from "../../shared/modules/security/security.service";
import { Tokens } from "../../shared/types/tokens.type";
import { DeleteTokenDTO } from "./dtos/delete-token.dto";
import { RefreshTokenDTO } from "./dtos/refresh-token.dto";
import { TokenService } from "../../shared/modules/jwt/token.service";
import { JwtPayload } from "./interfaces/jwt-payload.inteface";
@Injectable()
export class AuthService {

    public constructor(
        private readonly authRepository: AuthRepository,
        private readonly userService: UserService,
        private readonly tokenService: TokenService,
        private readonly securityService: SecurityService,
    ) { }

    public async login(dto: LoginDTO): Promise<Tokens> {

        const user = await this.userService.getUserByName(dto.name);

        if (!user) throw new UnauthorizedException('Invalid credentials');

        const passwordMatches = await this.securityService.compareData(dto.password, user.password);

        if (!passwordMatches) throw new UnauthorizedException('Invalid credentials');

        const tokenDto = {
            userId: user.id,
            deviceId: dto.deviceId,
            name: dto.name
        }

        return this.generateAndSaveTokens(tokenDto, user.id);
    }


    public async logout(dto: DeleteTokenDTO): Promise<void> {
        await this.authRepository.deleteToken(dto.userId, dto.deviceId);
    }

    public async refreshToken(dto: RefreshTokenDTO) {
        const authEntity = await this.authRepository.getEntityByDevice(dto.deviceId);

        if (!authEntity) throw new UnauthorizedException('Please, log in again');

        const rtMatches = await this.securityService.compareData(dto.refreshToken, authEntity.refreshToken);

        if (!rtMatches) throw new UnauthorizedException('Please, log in againn');

        const user = await this.userService.getUserById(authEntity.userId);

        if (!user) throw new UnauthorizedException('Please, log in againnn');

        const payload = {
            userId: user.id,
            deviceId: dto.deviceId,
            name: user.name
        }

        return this.generateAndSaveTokens(payload, authEntity.userId);
    }

    private async generateAndSaveTokens(payload: JwtPayload, userId: string): Promise<Tokens> {
        const refreshToken = await this.tokenService.generateRefreshToken();
        const accessToken = await this.tokenService.generateAccessToken(payload);

        await this.authRepository.deleteToken(userId, payload.deviceId);

        const parameters = {
            userId: userId,
            deviceId: payload.deviceId,
            refreshToken: await this.securityService.hashData(refreshToken)
        }

        await this.authRepository.createToken(parameters);

        return {
            access_token: accessToken,
            refresh_token: refreshToken
        };
    }
}