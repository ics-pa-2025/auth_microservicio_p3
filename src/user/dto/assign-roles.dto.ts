import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class AssignRolesDto {
    @IsArray({ message: 'roleIds debe ser un array' })
    @ArrayNotEmpty({ message: 'Debe proporcionar al menos un rol' })
    @IsUUID('4', { each: true, message: 'Cada roleId debe ser un UUID válido' })
    roleIds: string[];
}
