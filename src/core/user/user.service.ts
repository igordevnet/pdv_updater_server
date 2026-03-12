import { Injectable } from "@nestjs/common";
import { UserRepository } from "./repository/user.repository";
import { CreateUserDTO } from "./dto/create-user.dto";

@Injectable()
export class UserService{
    public constructor( 
        private readonly userRepository: UserRepository
    ) {}

    public createUser(dto: CreateUserDTO) {
        return this.userRepository.createUser(dto);
    }
}