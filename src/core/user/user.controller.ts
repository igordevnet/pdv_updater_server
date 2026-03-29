import { Controller, Patch, Post, Get, Delete, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { CreateUserDTO } from "./dtos/create-user.dto";
import { UserService } from "./user.service";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller('/user')
export class UserController {
    public constructor(
        private readonly userService: UserService
    ) {}

    @Post()
    @ApiOperation({ summary: 'Create a new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    @HttpCode(HttpStatus.CREATED)
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