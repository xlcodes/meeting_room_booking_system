import {ArgumentsHost, Catch, ExceptionFilter, HttpStatus} from '@nestjs/common';
import { Response } from 'express'

export class UnLoginException {
  message: string

  constructor(message?: string) {
    this.message = message
  }
}

@Catch()
export class UnLoginFilter<T> implements ExceptionFilter {
  catch(exception: UnLoginException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>()

    response.json({
      code: HttpStatus.UNAUTHORIZED,
      message: 'FAIL',
      data: exception.message || '用户未登陆'
    })
  }
}
