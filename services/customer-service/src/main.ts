import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { listRoutes } from './utils/list-routes';

async function bootstrap() {
  try {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Enable CORS
  app.enableCors();

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Customer Service API')
    .setDescription('Customer profile and preferences management')
    .setVersion('1.0')
    .addTag('Profile')
    .addTag('Address')
    .addTag('Preferences')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestDuration: true,
    },
    customSiteTitle: 'Customer Service API Docs',
    customCss: '.swagger-ui .topbar { display: none }', // Hide top bar
  });

  console.log('Swagger UI configured');

  // Database Connection Check
  try {
    const connection = app.get(DataSource); // or DataSource for TypeORM
    if (connection && connection.isInitialized) {
      console.log('Database connected');
    } else {
      console.warn('Database connection status unknown');
    }
  } catch (e) {
    console.warn('Could not verify database connection');
  }

  const port = configService.get('PORT', 3002);
  await app.listen(port);
  // Final Output
    console.log(`🚀 Customer Service running on port ${port}`);
    console.log(`📚 Swagger Docs: http://localhost:${port}/api/docs`);
    console.log(`📋 API Base URL: http://localhost:${port}/api/v1`);
    
    listRoutes(app, logger);

  } catch (error) {
    console.error('❌ Failed to start application:', error.message);
    process.exit(1);
  }
}
bootstrap();