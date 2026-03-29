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

        const updateData: any = {
            refreshToken: dto.refreshToken
        };

        if (dto.userId) {
            updateData.userId = dto.userId;
            updateData.deviceId = dto.deviceId;
            updateData.deviceName = dto.deviceName;
        }

        await this.authModel.findOneAndUpdate(
            { deviceId: dto.deviceId },
            { $set: updateData },
            { upsert: true, new: true }
        ).exec();
    }

    public async deleteToken(userId: string, deviceId: string): Promise<void> {
        await this.authModel.findOneAndDelete({ userId, deviceId }).exec();
    }

    public async getEntityByDevice(deviceId: string) {
        return this.authModel.findOne({ deviceId }).exec();
    }

}