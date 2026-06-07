import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { ExeType } from "src/shared/enums/exe.enum";

@Schema({ timestamps:true })
export class Update extends Document {
    @Prop({ required:true })
    userId: string;

    @Prop({ required:true })
    deviceId: string;

    @Prop({ required:true })
    exeVersion: string;

    @Prop({ required:true })
    exeType: ExeType;
}

export const UpdateSchema = SchemaFactory.createForClass(Update);