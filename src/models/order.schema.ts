import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type OrderDocument = Order & Document;

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PaymentMethod {
  ROOM_CHARGE = 'room-charge',
  ONLINE_PAYMENT = 'online-payment',
  CASH = 'cash',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum LocationType {
  LODGE = 'lodge',
  BAR_LOUNGE = 'bar-lounge',
}

@Schema({ _id: false })
export class OrderItem {
  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'MenuItem', required: true })
  menuItem: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  name: string;

  @ApiProperty()
  @Prop({ required: true })
  price: number;

  @ApiProperty()
  @Prop({ required: true, min: 1 })
  quantity: number;

  @ApiProperty()
  @Prop()
  specialInstructions?: string;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order {
  @ApiProperty()
  _id?: Types.ObjectId;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'Restaurant', required: true })
  restaurant: Types.ObjectId;

  @ApiProperty()
  @Prop({ required: true })
  orderNumber: string;

  @ApiProperty()
  @Prop({ required: true })
  customerName: string;

  @ApiProperty()
  @Prop({ type: String, enum: LocationType, required: true })
  locationType: LocationType;

  @ApiProperty()
  @Prop()
  roomNumber?: string;

  @ApiProperty()
  @Prop()
  tableNumber?: string;

  @ApiProperty({ type: [OrderItem] })
  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @ApiProperty()
  @Prop({ required: true })
  subtotal: number;

  @ApiProperty()
  @Prop({ default: 0 })
  tax: number;

  @ApiProperty()
  @Prop({ default: 0 })
  deliveryFee: number;

  @ApiProperty()
  @Prop({ required: true })
  total: number;

  @ApiProperty({ enum: PaymentMethod })
  @Prop({ type: String, enum: PaymentMethod, required: true })
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: PaymentStatus })
  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @ApiProperty({ enum: OrderStatus })
  @Prop({ type: String, enum: OrderStatus, default: OrderStatus.PENDING })
  status: OrderStatus;

  @ApiProperty()
  @Prop()
  specialInstructions?: string;

  @ApiProperty()
  @Prop()
  estimatedDeliveryTime?: Date;

  @ApiProperty()
  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @ApiProperty()
  createdAt?: Date;

  @ApiProperty()
  updatedAt?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Add indexes
OrderSchema.index({ restaurant: 1, orderNumber: 1 }, { unique: true });
OrderSchema.index({ restaurant: 1, status: 1 });
OrderSchema.index({ restaurant: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });