import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectEntityManager } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { EntityManager } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as config from 'config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    // private configService: ConfigService,
  ) {
    super({
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['jwt'];
          }
          return token;
        },
      ]),
    });
  }

  async validate(payload) {
    const { username } = payload;
    const user: User = await this.entityManager.findOneBy(User, { username });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}


// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     @InjectEntityManager()
//     private entityManager: EntityManager,
//     // private configService: ConfigService,
//   ) {
//     super({
//       secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     });
//   }

//   async validate(payload) {
//     const { username } = payload;
//     const user: User = await this.entityManager.findOneBy(User, { username });
//     if (!user) {
//       throw new UnauthorizedException();
//     }
//     return user;
//   }
// }
