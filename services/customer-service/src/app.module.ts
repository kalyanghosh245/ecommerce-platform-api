import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm'; 
import * as entities from '@ecommerce/shared'; 
import { ProfileModule } from './profile/profile.module';
import { AddressModule } from './address/address.module';
import { PreferencesModule } from './preferences/preferences.module'; 
 
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
        database: config.get<string>('DB_NAME', 'ecommerce_customer'),
        entities: Object.values(entities) as any,
        //synchronize: config.get<string>('NODE_ENV') !== 'production',
        logging: true,  // or 'all' | ['query', 'error'] | false
        logger: 'advanced-console', // 'simple-console' | 'file' | 'debug'
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
    ProfileModule,
    AddressModule,
    PreferencesModule,
  ],
}) 
export class AppModule {}