import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from 'src/models/user.schema';
import { CreateStaffDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateStaffDto  | Partial<User>, restaurantId: Types.ObjectId): Promise<UserDocument> {
    
    const createdUser = new this.userModel({
      ...createUserDto,
      restaurant: restaurantId,
    });
    
    return createdUser.save();
  }

//   find all users by restaurant
  async findAll(restaurantId: string): Promise<UserDocument[]> {
    const restaurantObjectId = new Types.ObjectId(restaurantId);
    return this.userModel.find({ restaurant: restaurantObjectId }).exec();
  }

  async findById(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('restaurant').exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


 async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }


  async update(id: string, updateData: Partial<User>): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true },
    ).exec();
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

        if (updateData.password) {
          updateData.password = await bcrypt.hash(updateData.password, 10);
        }
    
    return user;
  }

  async toggleActive(id: string): Promise<UserDocument> {

  if (!Types.ObjectId.isValid(id)) {
    throw new NotFoundException('Invalid user ID');
  }

  const user = await this.findById(id);
  
  const newStatus = !user.isActive;

  const updatedUser = await this.userModel
    .findByIdAndUpdate(
      id, 
      { isActive: newStatus }, 
      { new: true }
    )
    .exec();

  if (!updatedUser) {
    throw new NotFoundException('User not found');
  }

  return updatedUser;
}



  async delete(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }
}