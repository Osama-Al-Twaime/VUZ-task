import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Role, UserStatus } from 'src/enums';

@Schema({ versionKey: false })
export class User extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: Role, default: Role.USER, required: true })
  role: Role;

  @Prop({ enum: UserStatus, default: UserStatus.DISABLED, required: true })
  status: UserStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Shipment' }] })
  shipments: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
