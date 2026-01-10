import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type MenuItemDocument = MenuItem & Document;

@Schema({ timestamps: true })
export class MenuItem {
  @ApiProperty()
  _id?: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true })
  description: string;

  @ApiProperty()
  @Prop({ required: true })
  price: number;

  @ApiProperty()
  @Prop({ required: true })
  category: string;

  @ApiProperty()
  @Prop()
  image: string;

  @ApiProperty()
  @Prop({ required: true })
  preparationTime: number;

  @ApiProperty()
  @Prop({ default: true })
  available: boolean;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: [String], default: [] })
  tags: string[];

  @ApiProperty()
  @Prop({ type: Object })
  nutritionalInfo: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

export const MenuItemSchema = SchemaFactory.createForClass(MenuItem);

// Add indexes
MenuItemSchema.index({ restaurant: 1, category: 1 });
MenuItemSchema.index({ restaurant: 1, available: 1 });