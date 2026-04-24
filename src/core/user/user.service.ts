import { BadRequestException, Inject, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { UserRepository } from "./repositories/user.repository";
import { CreateUserDTO } from "./dtos/create-user.dto";
import { MessageI } from "src/shared/interfaces/message/message";
import { SecurityService } from "../../shared/modules/security/security.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import type { Cache } from "cache-manager";
import { UserDocument } from "./entities/user.entity";

@Injectable()
export class UserService {
    public constructor(
        private readonly userRepository: UserRepository,
        private readonly securityService: SecurityService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    public async createUser(dto: CreateUserDTO): Promise<MessageI> {
        await this.throwIfCnpjIsInUse(dto.cnpj);

        dto.password = await this.securityService.hashData(dto.password);

        await this.userRepository.createUser(dto);

        return { message: "User created successfully." }
    }

    private async throwIfCnpjIsInUse(cnpj: string) {
        const user = await this.userRepository.getUserByCNPJ(cnpj);

        if (user) throw new BadRequestException("This CNPJ is already in use.");
    }

    public async getUserByName(name: string) {
        const cacheKey = `auth_user_${name}`;

        const cachedUser = await this.cacheManager.get<UserDocument>(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }

        const user = await this.userRepository.getUserByName(name);
        if (!user) return null;

        await this.cacheManager.set(cacheKey, user, 300000);

        return user;
    }

    public async getUserById(id: string) {
        const cacheKey = `auth_user_${id}`;
        const cachedUser = await this.cacheManager.get<UserDocument>(cacheKey);
        if (cachedUser) {
            return cachedUser;
        }

        const user = await this.userRepository.getUserById(id);
        if (!user) return null;

        const secureUser = {
            id: user.id,
            name: user.name,
            cnpj: user.cnpj
        }

        await this.cacheManager.set(cacheKey, secureUser, 300000);
        return user;
    }
}