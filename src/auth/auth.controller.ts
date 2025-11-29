import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    UseGuards,
    ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/regiter.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body(ValidationPipe) dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body(ValidationPipe) dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(@Body(ValidationPipe) dto: RefreshDto) {
        return this.authService.refreshTokens(dto.refreshToken);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: any) {
        return this.authService.logout(req.user.userId);
    }

    // Este endpoint lo usan otros microservicios para validar un token
    @Get('validate')
    @UseGuards(JwtAuthGuard)
    async validate(@Req() req: any) {
        // req.user viene del JwtStrategy
        return { valid: true, user: req.user };
    }

    // Endpoint para obtener perfil del usuario autenticado
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Req() req: any) {
        return { user: req.user };
    }
}
