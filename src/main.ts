import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Habilita CORS igual que el backend core que funciona
    app.enableCors();
    await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
