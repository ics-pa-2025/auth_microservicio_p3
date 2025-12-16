export class ResponseUserDto {
    id: string;
    email: string;
    fullname?: string;
    phone?: string;
    address?: string;
    dni?: string;
    isActive?: boolean;
    roles?: string[];

    constructor(
        id: string,
        email: string,
        fullname: string,
        phone: string,
        address?: string,
        dni?: string,
        isActive?: boolean,
        roles?: string[]
    ) {
        this.id = id;
        this.email = email;
        this.fullname = fullname;
        this.phone = phone;
        this.address = address;
        this.dni = dni;
        this.isActive = isActive;
        this.roles = roles;
    }
}
