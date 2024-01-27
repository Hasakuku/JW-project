import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
// import { AuthCredentialDto } from './dto/auth-user.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthCredentialDto } from './dto/auth-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import * as nodemailer from 'nodemailer';
import { User } from 'src/users/entities/user.entity';
import { authMessage, userMessage } from 'src/response-type/message-type/message-type';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async OAuthLogin({ req, res }) {
    // 1. 회원조회
    const email: string = req.user.email;
    let user: any = await this.userService.getUserByEmail(email); //user를 찾아서

    // 2, 회원가입이 안되어있다면? 자동회원가입
    if (!user) user = await this.userService.createUser({ ...req.user }); //user가 없으면 하나 만들고, 있으면 이 if문에 들어오지 않을거기때문에 이러나 저러나 user는 존재하는게 됨.

    // 3. 회원가입이 되어있다면? 로그인(AT, RT를 생성해서 브라우저에 전송)한다
    // this.setRefreshToken({ user, res });
    const accessToken = await this.jwtService.sign(user);
    res.cookie('jwt', accessToken, { httpOnly: true });
    res.redirect('http://localhost:3000');
  }

  async signup(createUserDto: CreateUserDto): Promise<void> {
    await this.userService.createUser(createUserDto);
  }

  async login(authCredentialDto: AuthCredentialDto): Promise<string> {
    const { email, password } = authCredentialDto;
    const foundUser = await this.userService.getUserByEmail(email);

    if (!foundUser || !(await foundUser.validatePassword(password)))
      throw new UnauthorizedException(authMessage.LOGIN_FAILED);
    const payload = { email };
    const accessToken = await this.jwtService.sign(payload);
    return accessToken;
  }

  async sendCodeEmail(email: string): Promise<void> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000);
    const codeExpirationTime = new Date();
    const setCodeExpirationTime = new Date(codeExpirationTime);
    setCodeExpirationTime.setMinutes(codeExpirationTime.getMinutes() + 3);
    await this.userService.setResetCode(
      email,
      resetCode,
      setCodeExpirationTime,
    );

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset',
      text: `Auth Code: ${resetCode} \n CodeExpirationTime: ${setCodeExpirationTime}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyAuthCode(email: string, code: number): Promise<boolean> {
    const { resetPasswordCode, codeExpirationTime } =
      await this.userService.getUserByEmail(email);
    if (!resetPasswordCode) {
      throw new NotFoundException(userMessage.USER_NOTFOUND);
    }

    if (new Date() > codeExpirationTime) {
      throw new UnauthorizedException(authMessage.CODE_EXPIRED);
    }

    if (resetPasswordCode !== code) {
      throw new UnauthorizedException(authMessage.CODE_UNAUTHORIZED);
    }

    return true;
  }

  //  async resetPassword(email: string, newPassword: string): Promise<void> {
  //   const user = await this.userService.getUserByEmail(email);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   user.password = newPassword;
  //   user.resetPasswordCode = null; // Clear the reset token
  //   await this.userService.save(user);
  // }

  // async sendResetPasswordEmail(
  //   email: string,
  //   updateUserDto: UpdateUserDto,
  // ): Promise<void> {
  //   const user = await this.userService.getUserByEmail(email);
  //   if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

  //   const code = Math.floor(100000 + Math.random() * 900000); // 6자리 랜덤 인증 코드 생성
  //   user.resetPasswordCode = code;
  //   await this.userService.updateUser(email, updateUserDto);

  //   const transporter = nodemailer.createTransport({
  //     // 여기에 이메일 서비스 설정을 입력하세요.
  //   });

  //   const mailOptions = {
  //     from: 'your-email@example.com',
  //     to: email,
  //     subject: '비밀번호 재설정 코드',
  //     text: `비밀번호 재설정 코드는 ${code}입니다.`,
  //   };

  //   await transporter.sendMail(mailOptions);
  // }
}
