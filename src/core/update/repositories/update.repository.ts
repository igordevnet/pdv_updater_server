import { Model } from "mongoose";
import { Update } from "../entities/update.entity";
import { InjectModel } from "@nestjs/mongoose";
import { UpdateDTO } from "../dtos/update.dto";

export class UpdateRepository {
    public constructor(
        @InjectModel("Update")
        private readonly updateModel: Model<Update>) {}

    public createInstance(dto: UpdateDTO) {
        const update = new this.updateModel(dto);
        update.save();
    }

    public async updateInstance(dto: UpdateDTO) {
        await this.updateModel.updateOne(
        { deviceId: dto.deviceId, userId: dto.userId }, 
        { $set: { version: dto.version } }              
    }

}