import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePermissionDto {
    @IsString({ message: 'El nombre debe ser un string' })
    @IsNotEmpty({ message: 'El nombre es requerido' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    name: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser un string' })
    @MaxLength(255, {
        message: 'La descripción no puede exceder 255 caracteres',
    })
    description?: string;

    @IsOptional()
    @IsString({ message: 'El recurso debe ser un string' })
    @MaxLength(50, { message: 'El recurso no puede exceder 50 caracteres' })
    resource?: string;

    @IsOptional()
    @IsString({ message: 'La acción debe ser un string' })
    @MaxLength(50, { message: 'La acción no puede exceder 50 caracteres' })
    action?: string;
}
