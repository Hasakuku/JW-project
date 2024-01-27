import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
// import { AuthCredentialDto } from './dto/auth-user.dto';
import { User } from '../users/entities/user.entity';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthCredentialDto } from './dto/auth-user.dto';
import { TransformInterceptor } from 'src/response-type/response-type.interceptor';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './auth.decorator';
import { Response } from 'express';
import {
  CodeUnauthorized,
  LoginUnauthorized,
  Unauthorized,
} from 'src/response-type/swagger-response/response-type-401';
import {
  Authorized,
  CodeSend,
  Login,
} from 'src/response-type/response-type-success';
import { authMessage } from 'src/response-type/message-type/message-type';

interface IOAuthUser {
  user: {
    name: string;
    email: string;
    password: string;
  };
}

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() user: User) {
    console.log('req.user:', user);
  }

  @Post('/signup')
  @ApiOperation({ summary: '이메일 가입' })
  @ApiBody({ description: '사용자 등록', type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: '사용자 등록',
  })
  signup(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.authService.signup(createUserDto);
  }

  @Post('/login')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '이메일 로그인' })
  @ApiBody({
    type: AuthCredentialDto,
    description: '사용자 로그인 정보',
    examples: {
      '이메일 로그인': {
        summary: '이메일 로그인',
        value: {
          email: 'user@test.com',
          password: '123456',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: '사용자 로그인 (쿠키에 jwt 토큰 생성)',
    type: Login,
  })
  @ApiResponse({
    status: 401,
    description: authMessage.LOGIN_FAILED,
    type: LoginUnauthorized,
  })
  async login(
    @Body() authCredentialDto: AuthCredentialDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<object> {
    const accessToken = await this.authService.login(authCredentialDto);
    res.cookie('jwt', accessToken, { httpOnly: true });
    return { message: authMessage.LOGIN_SUCCESS };
  }

  @Get('/kakao/login')
  @UseGuards(AuthGuard('kakao'))
  async loginKakao(
    @Req() req: Request & IOAuthUser, //
    @Res() res: Response,
  ) {
    this.authService.OAuthLogin({ req, res });
  }

  @Delete('/logout')
  // @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '로그 아웃' })
  @ApiResponse({
    status: 204,
    description: '사용자 로그 아웃',
  })
  logout(@Res() res: Response): void {
    res.cookie('jwt', null, {
      maxAge: 0,
    });
    res.sendStatus(204);
  }

  @Patch('/withdraw')
  @ApiOperation({ summary: '사용자 탈퇴' })
  @ApiResponse({
    status: 204,
    description: '사용자 탈퇴',
  })
  withdraw() {}

  @Delete('/delete')
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiResponse({
    status: 204,
    description: '사용자 삭제',
  })
  deleteUser() {}

  @Post('send-code')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '인증 코드 발송' })
  @ApiResponse({
    status: 201,
    description: authMessage.CODE_SEND_SUCCESS,
    type: CodeSend,
  })
  async sendCodeEmail(@Body('email') email: string): Promise<object> {
    await this.authService.sendCodeEmail(email);
    return { message: authMessage.CODE_SEND_SUCCESS };
  }
  @Get('auth-code')
  @UseInterceptors(TransformInterceptor)
  @ApiOperation({ summary: '코드 인증' })
  @ApiResponse({
    status: 200,
    description: '코드 인증 완료',
    type: Authorized,
  })
  @ApiResponse({
    status: 401,
    description: '인증 오류',
    type: CodeUnauthorized,
  })
  async verifyAuthCode(
    @Body('email') email: string,
    @Body('code') code: number,
  ): Promise<object> {
    const result = await this.authService.verifyAuthCode(email, code);
    return { result };
  }
}
