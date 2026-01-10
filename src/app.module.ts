import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { configOpts } from './config/config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RestaurantsModule } from './modules/restaurants/restaurants.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { DashboardModule } from './modules/users/dashboard/dashboard.module';
import { OrdersModule } from './modules/orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot(configOpts),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri'),
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DashboardModule,
    RestaurantsModule,
    MenuItemsModule,
    UploadsModule,
    OrdersModule,
  ],

})
export class AppModule {}
