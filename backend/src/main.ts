import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { WinstonLoggerService } from './common/logger/winston-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Custom logger
  const logger = app.get(WinstonLoggerService);
  app.useLogger(logger);

  // Global prefix
  app.setGlobalPrefix('api');

  // CORS configuration
  const allowedOrigins = process.env.FRONTEND_URL 
    ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
    : ['http://localhost:3000'];
  
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed) || allowed === '*')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in production for Railway
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response transform interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('World of Books Scraper API')
    .setDescription('API for browsing and scraping World of Books products')
    .setVersion('1.0')
    .addTag('navigation', 'Navigation endpoints')
    .addTag('categories', 'Category endpoints')
    .addTag('products', 'Product endpoints')
    .addTag('scrape', 'Scraping endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);

  Logger.log(`🚀 Application is running on: http://localhost:${port}/api`, 'Bootstrap');
  Logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`, 'Bootstrap');
}

bootstrap();
