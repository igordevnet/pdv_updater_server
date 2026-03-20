import { InjectModel } from "@nestjs/mongoose";
import { Auth } from "../entities/auth.entity";
import { Model } from "mongoose";
import { CreateTokenDTO } from "../dtos/create-token.dto";

export class AuthRepository {

    public constructor(
        @InjectModel('Auth')
        private readonly authModel: Model<Auth>
    ) { }

    public createToken(dto: CreateTokenDTO) {
        const token = new this.authModel(dto);
        token.save();
    }

    public async deleteToken(userId: string, deviceId: string): Promise<void> {
        await this.authModel.findOneAndDelete({ userId, deviceId }).exec();
    }

    public async getEntityByDevice(deviceId: string) {
        return this.authModel.findOne({ deviceId }).exec();
    }

}