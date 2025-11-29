import {
    IsEmail,
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
    IsOptional
} from 'class-validator';

export class RegisterDto {
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @IsNotEmpty({ message: 'El email es requerido' })
    email: string;

    @IsString({ message: 'La contraseña debe ser un string' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @MaxLength(50, { message: 'La contraseña no puede exceder 50 caracteres' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,50}$/, {
        message:
            'La contraseña debe contener al menos: 1 minúscula, 1 mayúscula y 1 número',
    })
    password: string;

    @IsString({ message: 'El nombre completo debe ser un string' })
    @IsNotEmpty({ message: 'El nombre completo es requerido' })
    fullname: string;

    @IsOptional()
    @IsString({ message: 'El teléfono debe ser un string' })
    phone?: string;

    @IsOptional()
    @IsString({ message: 'La dirección debe ser un string' })
    address?: string;
}
