import { IsEmail, IsIn } from 'class-validator';

export class SendCodeDto {
  @IsEmail()
  email: string;

  @IsIn(['signup', 'resetPW'])
  type: string;
}
