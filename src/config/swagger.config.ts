import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function swaggerConfig(app: INestApplication) {

    const config = new DocumentBuilder()
        .setTitle('Updater API')
        .setDescription('API documentation for the application')
        .setVersion('1.0.1')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    
    SwaggerModule.setup('api-docs', app, document);
}