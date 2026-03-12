import { InjectModel } from "@nestjs/mongoose";
import { UserDocument } from "../entity/user.entity";
import { Model } from "mongoose";
import { CreateUserDTO } from "../dto/create-user.dto";

export class UserRepository {
    public constructor (
        @InjectModel('User')
        private readonly userModel: Model<UserDocument>
    ) {}

    async createUser(dto: CreateUserDTO) {
        await this.userModel.create(dto);
    }
}