import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps:true })
export class Update extends Document {
    @Prop({ required:true })
    userId: string;

    @Prop({ required:true })
    deviceId: string;

    @Prop({ required:true })
    exeVersion: string;
}

export const UpdateSchema = SchemaFactory.createForClass(Update);