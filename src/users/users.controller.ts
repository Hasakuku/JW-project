import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ConflictException,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { TransformInterceptor } from 'src/response-type/response-type.interceptor';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회',
    type: Array<User>,
  })
  async getUserAll(): Promise<User[]> {
    return await this.userService.getUserAll();
  }

  @Get('check-email')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '이메일 중복 확인' })
  async checkEmail(@Query('email') email: string): Promise<object> {
    const result = await this.userService.checkEmail(email);
    return { result };
  }

  @Get('check-nickname')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '닉네임 중복 확인' })
  async checkNickname(@Query('nickname') nickname: string): Promise<object> {
    const result = await this.userService.checkNickname(nickname);
    return { result };
  }

  @Patch('reset-password')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '비밀번호 재설정' })
  async updatePassword(
    @Body('email') email: string,
    @Body('newPassword') newPassword: string,
  ): Promise<object> {
    const result = await this.userService.updatePassword(email, newPassword);
    return { result };
  }

  @Get('/:id')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '사용자 정보 조회' })
  @ApiParam({ name: 'id', description: '사용자 ID' })
  @ApiResponse({
    status: 200,
    description: '사용자 목록 조회',
    type: User,
  })
  async getUser(@Param('id') userId: number): Promise<User> {
    return await this.userService.getUserById(userId);
  }

  @Patch('/:id')
  @UseInterceptors(TransformInterceptor)
  async updateUser(
    @Param('id') userId: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<object> {
    const result = await this.userService.updateUser(userId, updateUserDto);
    return { result };
  }
}
