import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";

@Schema({ timestamps: true })
export class Auth {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    deviceName: string;

    @Prop({ required: true })
    deviceId: string;

    @Prop({ required: true, unique: true })
    refreshToken: string;

}

export const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.index({ deviceId: 1 }, { unique: true });