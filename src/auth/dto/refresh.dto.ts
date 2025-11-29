import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshDto {
    @IsString({ message: 'El refresh token debe ser un string' })
    @IsNotEmpty({ message: 'El refresh token es requerido' })
    refreshToken: string;
}
