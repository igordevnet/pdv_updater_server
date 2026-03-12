import { Controller, Patch, Post, Get, Delete, Body } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";
import { UserService } from "./user.service";

@Controller('user')
export class UserController {
    public constructor(
        private readonly userService: UserService
    ) {}

    @Post()
    public createUser(@Body() dto: CreateUserDTO){
        return this.userService.createUser(dto)
    }

    @Patch()
    public updateUser(){}

    @Get()
    public getUser() {}

    @Delete(':id')
    public deleteUser() {}
}