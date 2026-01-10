import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Order,
  OrderDocument,
  OrderStatus,
  PaymentStatus,
} from 'src/models/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { Restaurant, RestaurantDocument } from 'src/models/restaurant.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Restaurant.name)
    private restaurantModel: Model<RestaurantDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<OrderDocument> {

    if (!Types.ObjectId.isValid(createOrderDto.restaurantId)) {
      throw new BadRequestException('Invalid restaurant ID');
    }

    const restaurantId = new Types.ObjectId(createOrderDto.restaurantId);

    const restaurant = await this.restaurantModel.findById(restaurantId).exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const orderNumber = await this.generateOrderNumber(restaurant);

    // Calculate totals
    const subtotal = createOrderDto.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const tax = subtotal * 0.1; 
    const deliveryFee = 0; 
    const total = subtotal + tax + deliveryFee;

    // Map items
    const items = createOrderDto.items.map((item) => ({
      menuItem: new Types.ObjectId(item.menuItemId),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const estimatedDeliveryTime = new Date();
    estimatedDeliveryTime.setMinutes(
      estimatedDeliveryTime.getMinutes() + 30 + Math.floor(Math.random() * 15),
    );

    // Create order
    const order = new this.orderModel({
      restaurant: restaurantId,
      orderNumber,
      customerName: createOrderDto.customerName,
      locationType: createOrderDto.locationType,
      roomNumber: createOrderDto.roomNumber,
      tableNumber: createOrderDto.tableNumber,
      items,
      subtotal,
      tax,
      deliveryFee,
      total,
      paymentMethod: createOrderDto.paymentMethod,
      paymentStatus: PaymentStatus.PENDING,
      status: OrderStatus.PENDING,
      specialInstructions: createOrderDto.specialInstructions,
      estimatedDeliveryTime,
    });

    const savedOrder = await order.save();

    return savedOrder;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderDocument> {
    const order = await this.orderModel
      .findOne({ orderNumber })
      .populate('restaurant', 'name slug')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async findAllByRestaurant(
    restaurantId: string,
    status?: OrderStatus,
  ): Promise<OrderDocument[]> {
    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const filter: any = { restaurant: restaurantObjectId };
    if (status) {
      filter.status = status;
    }

    return this.orderModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    restaurantId: string,
  ): Promise<OrderDocument> {
    const restaurantObjectId = new Types.ObjectId(restaurantId);
    const orderObjectId = new Types.ObjectId(orderId);

    const order = await this.orderModel
      .findOneAndUpdate(
        { _id: orderObjectId, restaurant: restaurantObjectId },
        { status },
        { new: true },
      )
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  private async generateOrderNumber(
    restaurant: RestaurantDocument,
  ): Promise<string> {
    const now = new Date();
  
    const nameParts = restaurant.name.split(' ');
    let prefix = '';

    if (nameParts.length === 1) {
  
      prefix = nameParts[0].substring(0, 4).toUpperCase();
    } else {
    
      prefix = nameParts
        .slice(0, 4)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
    }

    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '').slice(2);
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    const todayCount = await this.orderModel
      .countDocuments({
        restaurant: restaurant._id,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      })
      .exec();

    const sequence = (todayCount + 1).toString().padStart(4, '0');

    return `${prefix}-${dateStr}-${sequence}`;
  }
}
