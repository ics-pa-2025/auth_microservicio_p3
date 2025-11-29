import { ResponseUserDto } from '../../user/dto/response-user.dto';

export class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: ResponseUserDto;

    constructor(
        accessToken: string,
        refreshToken: string,
        user: ResponseUserDto
    ) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }
}
