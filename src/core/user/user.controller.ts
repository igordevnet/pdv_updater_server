import { Controller, Patch, Post, Get, Delete, Body } from "@nestjs/common";
import { CreateUserDTO } from "./dto/create-user.dto";

@Controller('user')
export class UserController {
    @Post()
    public createUser(@Body() dto: CreateUserDTO){}

    @Patch()
    public updateUser(){}

    @Get()
    public getUser() {}

    @Delete(':id')
    public deleteUser() {}
}