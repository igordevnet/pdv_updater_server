import { InjectModel } from "@nestjs/mongoose";
import { Auth } from "../entities/auth.entity";
import { Model } from "mongoose";
import { CreateTokenDTO } from "../dtos/create-token.dto";

export class AuthRepository {

    public constructor(
        @InjectModel('Auth')
        private readonly authModel: Model<Auth>,
    ) { }

    public async upsertToken(dto: CreateTokenDTO) {
        await this.authModel.findOneAndUpdate(
            { userId: dto.userId, deviceId: dto.deviceId },
            { $set: dto },
            { upsert: true, new: true }
        ).exec();
    }

    public async deleteToken(userId: string, deviceId: string): Promise<void> {
        await this.authModel.findOneAndDelete({ userId, deviceId }).exec();
    }

    public async getEntityByDevice(deviceId: string) {
        return this.authModel
            .findOne({ deviceId })
            .select('_id userId deviceId') 
            .lean()
            .exec();
    }

}