export class ResponseUserDto {
    id: string;
    email: string;
    fullname?: string;
    phone?: string;
    address?: string;
    isActive?: boolean;
    rolesId?: string[];

    constructor(
        id: string,
        email: string,
        fullname: string,
        phone: string,
        address?: string,
        isActive?: boolean,
        rolesId?: string[]
    ) {
        this.id = id;
        this.email = email;
        this.fullname = fullname;
        this.phone = phone;
        this.address = address;
        this.isActive = isActive;
        this.rolesId = rolesId;
    }
}
