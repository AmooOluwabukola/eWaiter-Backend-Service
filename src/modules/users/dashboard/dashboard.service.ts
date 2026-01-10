import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from 'src/models/order.schema';
import { MenuItem, MenuItemDocument } from 'src/models/menu-item.schema';
import { User, UserDocument } from 'src/models/user.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getAdminStats(restaurantId: string) {
    const restaurantObjectId = new Types.ObjectId(restaurantId);

    // Total orders
    const totalOrders = await this.orderModel.countDocuments({
      restaurant: restaurantObjectId,
    }).exec();

    // Orders by status
    const pendingOrders = await this.orderModel.countDocuments({
      restaurant: restaurantObjectId,
      status: 'pending',
    }).exec();

    const preparingOrders = await this.orderModel.countDocuments({
      restaurant: restaurantObjectId,
      status: 'preparing',
    }).exec();

    const completedOrders = await this.orderModel.countDocuments({
      restaurant: restaurantObjectId,
      status: { $in: ['delivered', 'ready'] },
    }).exec();

    // Total revenue
    const revenueResult = await this.orderModel.aggregate([
      {
        $match: {
          restaurant: restaurantObjectId,
          status: { $in: ['delivered', 'ready'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]).exec();

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Today's revenue
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayRevenueResult = await this.orderModel.aggregate([
      {
        $match: {
          restaurant: restaurantObjectId,
          status: { $in: ['delivered', 'ready'] },
          createdAt: { $gte: today },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]).exec();

    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    // Menu items stats
    const totalMenuItems = await this.menuItemModel.countDocuments({
      restaurant: restaurantObjectId,
    }).exec();

    const availableMenuItems = await this.menuItemModel.countDocuments({
      restaurant: restaurantObjectId,
      available: true,
    }).exec();

    // Staff count
    const totalStaff = await this.userModel.countDocuments({
      restaurant: restaurantObjectId,
      role: { $in: ['kitchen_staff', 'attendant'] },
    }).exec();

    const activeStaff = await this.userModel.countDocuments({
      restaurant: restaurantObjectId,
      role: { $in: ['kitchen_staff', 'attendant'] },
      isActive: true,
    }).exec();

    return {
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        preparing: preparingOrders,
        completed: completedOrders,
      },
      revenue: {
        total: totalRevenue,
        today: todayRevenue,
      },
      menuItems: {
        total: totalMenuItems,
        available: availableMenuItems,
        unavailable: totalMenuItems - availableMenuItems,
      },
      staff: {
        total: totalStaff,
        active: activeStaff,
        inactive: totalStaff - activeStaff,
      },
    };
  }

  async getRecentOrders(restaurantId: string, limit: number = 10) {
    const restaurantObjectId = new Types.ObjectId(restaurantId);

    return this.orderModel
      .find({ restaurant: restaurantObjectId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('assignedTo', 'name email')
      .exec();
  }

  async getTopItems(restaurantId: string, limit: number = 5) {
    const restaurantObjectId = new Types.ObjectId(restaurantId);

    const topItems = await this.orderModel.aggregate([
      {
        $match: {
          restaurant: restaurantObjectId,
          status: { $in: ['delivered', 'ready'] },
        },
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.menuItem',
          name: { $first: '$items.name' },
          totalOrdered: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        },
      },
      { $sort: { totalOrdered: -1 } },
      { $limit: limit },
    ]).exec();

    return topItems;
  }
}