import { ApiProperty } from '@nestjs/swagger';
import { ErrorResponse } from './response-type';

export class NotFound extends ErrorResponse {
  @ApiProperty({ example: 404 })
  statusCode: number;

  @ApiProperty({ example: 'NotFound' })
  error: string;

  @ApiProperty({ example: '찾을 수 없음' })
  message: string;
}
