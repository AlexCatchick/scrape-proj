import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule } from '@nestjs/throttler';

import { NavigationModule } from './modules/navigation/navigation.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { ScrapeModule } from './modules/scrape/scrape.module';
import { CommonModule } from './common/common.module';
import { HealthModule } from './modules/health/health.module';
import { ViewHistoryModule } from './modules/view-history/view-history.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database - supports Railway's DATABASE_URL or individual env vars
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get('DATABASE_URL');
        
        if (databaseUrl) {
          // Parse DATABASE_URL for Railway/Heroku style
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            synchronize: configService.get('NODE_ENV') !== 'production',
            logging: configService.get('NODE_ENV') === 'development',
            ssl: configService.get('DATABASE_SSL') === 'true' ? { rejectUnauthorized: false } : false,
          };
        }
        
        // Fallback to individual env vars
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'localhost'),
          port: configService.get('DATABASE_PORT', 5432),
          username: configService.get('DATABASE_USERNAME', 'postgres'),
          password: configService.get('DATABASE_PASSWORD', 'password'),
          database: configService.get('DATABASE_NAME', 'worldofbooks'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
    }),

    // Redis Queue - supports Railway's REDIS_URL or Upstash
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get('REDIS_URL');
        
        if (redisUrl) {
          // Parse Redis URL (Railway/Upstash style)
          return { 
            redis: redisUrl,
          };
        }
        
        // Fallback to individual env vars
        const redisConfig: any = {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: configService.get('REDIS_PORT', 6379),
        };

        const password = configService.get('REDIS_PASSWORD');
        if (password) {
          redisConfig.password = password;
        }

        if (configService.get('REDIS_TLS') === 'true') {
          redisConfig.tls = {};
        }

        return { redis: redisConfig };
      },
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Application Modules
    CommonModule,
    HealthModule,
    NavigationModule,
    CategoriesModule,
    ProductsModule,
    ScrapeModule,
    ViewHistoryModule,
  ],
})
export class AppModule {}
