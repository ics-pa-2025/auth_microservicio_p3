import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const corsConfig = (configService: ConfigService): CorsOptions => ({
    origin: [
        configService.get<string>('FRONTEND_URL_DEV') ||
            'http://localhost:5172',
        configService.get<string>('FRONTEND_URL_PROD') ||
            'https://tu-frontend.azurewebsites.net',
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
});
