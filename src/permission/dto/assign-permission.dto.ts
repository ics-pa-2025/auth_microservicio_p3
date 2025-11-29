import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignPermissionsDto {
    @IsArray({ message: 'permissionIds debe ser un array' })
    @ArrayNotEmpty({ message: 'Debe proporcionar al menos un permiso' })
    @IsUUID('4', {
        each: true,
        message: 'Cada permissionId debe ser un UUID válido',
    })
    permissionIds: string[];
}
