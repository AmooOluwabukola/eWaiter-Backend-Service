import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Restaurant, RestaurantDocument } from 'src/models/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name) private restaurantModel: Model<RestaurantDocument>,
  ) {}

  // async create(createRestaurantDto: CreateRestaurantDto): Promise<RestaurantDocument> {
  //   const slug = this.generateSlug(createRestaurantDto.name);
    
  //   // Check if slug already exists
  //   const existing = await this.restaurantModel.findOne({ slug }).exec();
  //   if (existing) {
  //     throw new ConflictException('Restaurant with similar name already exists');
  //   }

  //   const createdRestaurant = new this.restaurantModel({
  //     ...createRestaurantDto,
  //     slug,
  //     settings: createRestaurantDto.settings || {
  //       currency: 'USD',
  //       timezone: 'UTC',
  //       allowTableOrders: true,
  //       allowRoomOrders: true,
  //     },
  //   });
    
  //   return createdRestaurant.save();
  // }
  private generateSlug(name: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  // Add timestamp to make it more unique
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  
  return `${baseSlug}-${timestamp}${random}`;
}

async create(createRestaurantDto: CreateRestaurantDto): Promise<RestaurantDocument> {
  const slug = this.generateSlug(createRestaurantDto.name);
  
  console.log('Creating restaurant with slug:', slug);

  // Check if slug already exists (very unlikely with timestamp+random)
  const existing = await this.restaurantModel.findOne({ slug }).exec();
  if (existing) {
    console.log('Slug collision detected, regenerating...');
    // If by some miracle there's a collision, regenerate
    return this.create(createRestaurantDto);
  }

  const createdRestaurant = new this.restaurantModel({
    ...createRestaurantDto,
    slug,
    settings: createRestaurantDto.settings || {
      currency: 'USD',
      timezone: 'UTC',
      allowTableOrders: true,
      allowRoomOrders: true,
    },
  });
  
  return createdRestaurant.save();
}

  async findAll(): Promise<RestaurantDocument[]> {
    return this.restaurantModel.find().populate('owner').exec();
  }

  // async findById(id: string): Promise<RestaurantDocument> {
  //   const restaurantId = new Types.ObjectId(id);
  //   const restaurant = await this.restaurantModel.findById(restaurantId).populate('owner').exec();
  //   if (!restaurant) {
  //     throw new NotFoundException('Restaurant not found');
  //   }
  //   return restaurant;
  // }
async findById(id: string): Promise<RestaurantDocument> {

  if (!id || !Types.ObjectId.isValid(id)) {
    console.error('Invalid ObjectId format');
    throw new BadRequestException('Invalid restaurant ID format');
  }
  
  const restaurantId = new Types.ObjectId(id);
  const restaurant = await this.restaurantModel
    .findById(restaurantId)
    .populate('owner')
    .exec();
  
  if (!restaurant) {
    console.error('Restaurant not found');
    throw new NotFoundException('Restaurant not found');
  }
  
  
  return restaurant;
}
  async findBySlug(slug: string): Promise<RestaurantDocument> {
    const restaurant = await this.restaurantModel.findOne({ slug }).populate('owner').exec();
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    return restaurant;
  }

  async setOwner(restaurantId: Types.ObjectId, ownerId: Types.ObjectId): Promise<RestaurantDocument> {
    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      restaurantId,
      { owner: ownerId },
      { new: true },
    ).exec();
    
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    
    return restaurant;
  }

  async update(id: string, updateData:UpdateRestaurantDto): Promise<RestaurantDocument> {
    const restaurant = await this.restaurantModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();
    
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    
    return restaurant;
  }

  async toggleActive(id: string): Promise<RestaurantDocument> {
    const restaurant = await this.findById(id);
    restaurant.isActive = !restaurant.isActive;
    
    const updatedRestaurant = await this.restaurantModel.findByIdAndUpdate(
      id, 
      { isActive: restaurant.isActive }, 
      { new: true }
    ).exec();
    
    if (!updatedRestaurant) {
      throw new NotFoundException('Restaurant not found');
    }
    
    return updatedRestaurant;
  }

 
}