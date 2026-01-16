import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum UserRole {
  SUPER_ADMIN= 'super_admin',
  RESTAURANT_ADMIN = 'restaurant_admin',
  KITCHEN_STAFF = 'kitchen_staff',
  ATTENDANT = 'attendant',
}

@Schema({ timestamps: true })
export class User {
  @ApiProperty()
  _id?: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @ApiProperty({ enum: UserRole })
  @Prop({ type: String, enum: UserRole, required: true })
  role: UserRole;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Prop({ default: false })
  isEmailVerified: boolean;

  @ApiProperty()
  @Prop()
  emailVerificationToken?: string;

  @ApiProperty()
  @Prop()
  emailVerificationExpires?: Date;

  @ApiProperty()
  @Prop()
  passwordResetToken?: string;

  @ApiProperty()
  @Prop()
  passwordResetExpires?: Date;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes
UserSchema.index({ email: 1 });
UserSchema.index({ restaurant: 1, role: 1 });
UserSchema.index({ restaurant: 1, isActive: 1 });
UserSchema.index({ emailVerificationToken: 1 });
