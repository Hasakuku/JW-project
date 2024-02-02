import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: '3f9afa0045d4d2e28e15fe477c6f683a',
      callbackURL: 'http://localhost:3000/api/v1/auth/kakao/login',
      clientSecret: '',
      scope: ['account_email', 'profile_nickname'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    account: any,
  ): Promise<any> {
    const user = {
      a: account._json.kakao_account,
      email: account._json.kakao_account.email,
      password: account.id,
      username: account.username,
      provider: account.provider,
      profileImage: account._json.kakao_account.profile.profile_image_url,
    };
    return user;
  }
}

// @Injectable()
// export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
//   constructor(private readonly authService: AuthService) {
//     super({
//       clientID: process.env.KAKAO_CLIENT_ID,
//       callbackURL: process.env.KAKAO_CALLBACK_URL,
//       passReqToCallback: true,
//     });
//   }

//   async validate(
//     request: any,
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//     done: VerifyCallback,
//   ): Promise<any> {
//     const { username, emails } = profile;
//     const user = {
//       email: emails[0].value,
//       username,
//       provider: 'kakao',
//     };
//     const jwt: string = await this.authService.validateOAuthLogin(
//       user,
//       Provider.KAKAO,
//     );
//     done(null, jwt);
//   }
// }
