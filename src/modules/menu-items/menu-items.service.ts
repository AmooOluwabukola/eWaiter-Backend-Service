import { Injectable, NotFoundException, ForbiddenException,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MenuItem, MenuItemDocument } from 'src/models/menu-item.schema';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuItemsService {
  constructor(
    @InjectModel(MenuItem.name) private menuItemModel: Model<MenuItemDocument>,
  ) {}

  async create(
    createMenuItemDto: CreateMenuItemDto,
    restaurantId: string,
  ): Promise<MenuItemDocument> {
    
    const createdMenuItem = new this.menuItemModel({
      ...createMenuItemDto,
      restaurant: new Types.ObjectId(restaurantId),
    });
    
    const saved = await createdMenuItem.save();
    
    return saved;
  }

  async findAll(restaurantId: string | Types.ObjectId): Promise<MenuItemDocument[]> {
  
    const restaurantObjectId = typeof restaurantId === 'string' 
      ? new Types.ObjectId(restaurantId)
      : restaurantId;
    
    const items = await this.menuItemModel
      .find({ restaurant: restaurantObjectId })
      .sort({ category: 1, name: 1 })
      .exec();
    
    return items;
  }

  async findAllPublic(restaurantId: string): Promise<MenuItemDocument[]> {
    const restaurantObjectId = new Types.ObjectId(restaurantId);
    
    return this.menuItemModel
      .find({ restaurant: restaurantObjectId, available: true })
      .sort({ category: 1, name: 1 })
      .exec();
  }

  async findByCategory(restaurantId: string, category: string): Promise<MenuItemDocument[]> {
    const restaurantObjectId = new Types.ObjectId(restaurantId);
    
    return this.menuItemModel
      .find({ restaurant: restaurantObjectId, category, available: true })
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string): Promise<MenuItemDocument> {
    const menuItem = await this.menuItemModel.findById(id).exec();
    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }
    return menuItem;
  }

  async update(
    id: string,
    updateMenuItemDto: UpdateMenuItemDto,
    restaurantId: string,
  ): Promise<MenuItemDocument> {
    const menuItem = await this.findById(id);
    
    if (menuItem.restaurant.toString() !== restaurantId) {
      throw new ForbiddenException('You do not have permission to update this item');
    }

    const updatedMenuItem = await this.menuItemModel.findByIdAndUpdate(
      id,
      updateMenuItemDto,
      { new: true },
    ).exec();

    if (!updatedMenuItem) {
      throw new NotFoundException('Menu item not found');
    }

    return updatedMenuItem;
  }



  async delete(id: string, restaurantId: string): Promise<void> {
    const menuItem = await this.findById(id);
    
    // Verify the menu item belongs to this restaurant
    if (menuItem.restaurant.toString() !== restaurantId) {
      throw new ForbiddenException('You do not have permission to delete this item');
    }

    const result = await this.menuItemModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Menu item not found');
    }
  }

  async getCategories(restaurantId: string): Promise<string[]> {
    const restaurantObjectId = new Types.ObjectId(restaurantId);
    
    const categories = await this.menuItemModel
      .distinct('category', { restaurant: restaurantObjectId })
      .exec();
    return categories;
  }

  async getStats(restaurantId: string) {
    const restaurantObjectId = new Types.ObjectId(restaurantId);
    
    const total = await this.menuItemModel
      .countDocuments({ restaurant: restaurantObjectId })
      .exec();
    
    const available = await this.menuItemModel
      .countDocuments({ restaurant: restaurantObjectId, available: true })
      .exec();
    
    const unavailable = total - available;
    const categories = await this.getCategories(restaurantId);

    return {
      total,
      available,
      unavailable,
      categoriesCount: categories.length,
      categories,
    };
  }
}