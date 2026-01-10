import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type RestaurantDocument = Restaurant & Document;

@Schema({ timestamps: true })
export class Restaurant {
  @ApiProperty()
  _id?: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true, unique: true })
  slug: string;

  @ApiProperty()
  @Prop()
  description: string;

  @ApiProperty()
  @Prop()
  logo: string;

  @ApiProperty()
  @Prop()
  address: string;

  @ApiProperty()
  @Prop()
  phone: string;

  @ApiProperty()
  @Prop()
  email: string;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  @ApiProperty()
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty()
  @Prop({ type: Object })
  settings: {
    currency: string;
    timezone: string;
    allowTableOrders: boolean;
    allowRoomOrders: boolean;
  };

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);