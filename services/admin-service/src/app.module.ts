import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ProductAdminModule } from './product-admin/product-admin.module';
import { OrderAdminModule } from './order-admin/order-admin.module';
import { CustomerAdminModule } from './customer-admin/customer-admin.module';
import { DashboardModule } from './dashboard/dashboard.module';
import * as entities from '@ecommerce/shared';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'], 
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '5432'), 10),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'password'),
        database: config.get<string>('DB_NAME', 'ecommerce_product'),
        entities: Object.values(entities) as any,
        synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: config.get<string>('NODE_ENV') === 'development',
        poolSize: 20,
        extra: {
          max: 20,
          connectionTimeoutMillis: 5000,
          query_timeout: 5000,
          statement_timeout: 5000,
        },
      }),
      inject: [ConfigService],
    }),
    ProductAdminModule,
    OrderAdminModule,
    CustomerAdminModule,
    DashboardModule,
  ],
}) 
export class AppModule {}