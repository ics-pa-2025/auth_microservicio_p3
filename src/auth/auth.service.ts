import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/regiter.dto';
import { LoginDto } from './dto/login.dto';
import { ResponseUserDto } from '../user/dto/response-user.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UserService,
        private readonly jwt: JwtService,
        private readonly config: ConfigService // Inyectar ConfigService
    ) {}

    // ---------- REGISTRO ----------
    async register(registerDto: RegisterDto) {
        const existing = await this.users.findByEmail(registerDto.email);
        if (existing) throw new BadRequestException('Email ya registrado');

        // Validación adicional de contraseña
        if (registerDto.password.length < 8) {
            throw new BadRequestException(
                'La contraseña debe tener al menos 8 caracteres'
            );
        }

        console.log('Register DTO:', registerDto); // Log para debugging

        const passwordHash = await this.hash(registerDto.password);
        const user = await this.users.create(
            registerDto.email,
            passwordHash,
            registerDto.fullname,
            registerDto.phone ?? '',
            registerDto.address ?? ''
        );

        const { accessToken, refreshToken } = await this.issueTokens(
            user.id,
            user.email
        );

        const userDto = new ResponseUserDto(
            user.id,
            user.email,
            user.fullname,
            user.phone,
            user.address
        );

        return new AuthResponseDto(accessToken, refreshToken, userDto);
    }

    // ---------- LOGIN ----------
    async login(loginDto: LoginDto) {
        const user = await this.users.findByEmail(loginDto.email);
        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const ok = await this.verifyHash(loginDto.password, user.password);
        if (!ok) throw new UnauthorizedException('Credenciales inválidas');

        // Opcional: Verificar si el usuario está activo/verificado
        if (!user.isActive) throw new UnauthorizedException('Cuenta desactivada');

        const { accessToken, refreshToken } = await this.issueTokens(
            user.id,
            user.email
        );

        const userDto = new ResponseUserDto(
            user.id,
            user.email,
            user.fullname,
            user.phone,
            user.address
        );

        return new AuthResponseDto(accessToken, refreshToken, userDto);
    }

    // ---------- REFRESH TOKEN ----------
    async refreshTokens(refreshToken: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token requerido');
        }

        try {
            const payload = this.jwt.verify(refreshToken, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'), // Usar ConfigService
            });

            if (payload.type !== 'refresh') {
                throw new UnauthorizedException('Token inválido');
            }

            const user = await this.users.findByEmail(payload.email);
            if (!user || !user.refreshTokenHash) {
                throw new UnauthorizedException('Token inválido');
            }

            const valid = await this.verifyHash(
                refreshToken,
                user.refreshTokenHash
            );
            if (!valid) throw new UnauthorizedException('Token inválido');

            const { accessToken, refreshToken: newRefresh } =
                await this.issueTokens(user.id, user.email);

            return { accessToken, refreshToken: newRefresh };
        } catch (error) {
            // Log del error para debugging (opcional)
            console.error('Error refreshing token:', error.message);
            throw new UnauthorizedException('Token inválido');
        }
    }

    // ---------- LOGOUT ----------
    async logout(userId: string) {
        // Invalidar el refresh token del usuario
        await this.users.setRefreshTokenHash(userId, null);
        return { message: 'Logout exitoso' };
    }

    // ---------- VALIDACIÓN DE TOKEN (manual) ----------
    async validateToken(token: string) {
        try {
            const payload = this.jwt.verify(token, {
                secret: this.config.get<string>('JWT_ACCESS_SECRET'), // Usar ConfigService
            });

            // Verificar que el usuario aún existe
            const user = await this.users.findByEmail(payload.email);
            if (!user) {
                return { valid: false };
            }

            return {
                valid: true,
                userId: payload.sub,
                email: payload.email,
                iat: payload.iat,
                exp: payload.exp,
            };
        } catch (error) {
            return { valid: false };
        }
    }

    // ---------- HELPERS ----------
    private async issueTokens(userId: string, email: string) {
        const accessToken = this.signAccessToken(userId, email);
        const refreshToken = this.signRefreshToken(userId, email);
        const refreshTokenHash = await this.hash(refreshToken);

        await this.users.setRefreshTokenHash(userId, refreshTokenHash);

        return { accessToken, refreshToken };
    }

    private async hash(data: string): Promise<string> {
        const salt = await bcrypt.genSalt(12); // Aumentar rounds de salt
        return bcrypt.hash(data, salt);
    }

    private async verifyHash(data: string, hash: string): Promise<boolean> {
        return bcrypt.compare(data, hash);
    }

    private signAccessToken(userId: string, email: string): string {
        const payload = { sub: userId, email };
        return this.jwt.sign(payload, {
            secret: this.config.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') || '15m',
        });
    }

    private signRefreshToken(userId: string, email: string): string {
        const payload = { sub: userId, email, type: 'refresh' };
        return this.jwt.sign(payload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') || '7d',
        });
    }
}
