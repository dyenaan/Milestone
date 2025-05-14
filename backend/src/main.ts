import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') || 3000;

    // Enable CORS
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'http://localhost:3001',
            'https://accounts.google.com',
            'https://appleid.apple.com',
            // Add your production domains here
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        credentials: true,
    });

    // Setup global validation pipe
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
    }));

    // Setup Swagger documentation
    const swaggerConfig = new DocumentBuilder()
        .setTitle('MQ3K API')
        .setDescription('MQ3K Platform API Documentation')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api-docs', app, document);

    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap(); 