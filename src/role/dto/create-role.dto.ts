import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
    name: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser un string' })
    @MaxLength(255, {
        message: 'La descripción no puede exceder 255 caracteres',
    })
    description?: string;
}
