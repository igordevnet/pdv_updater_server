import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function swaggerConfig(app: INestApplication) {
    if (process.env.NODE_ENV !== 'production') {
      const config = new DocumentBuilder()
        .setTitle('Minha API')
        .setDescription('Documentação interna')
        .setVersion('2.1.0')
        .addBearerAuth()
        .build();
        
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document);
  }
}