import { Next } from 'koa'
import { IRouterContext } from 'koa-router'
import {
  HttpException,
  ParameterException,
  WrongUrlException
} from '../exception'
import codes from '../exception/exception-code'

const catchError = async (ctx: IRouterContext, next: Next) => {
  try {
    await next()
    if (ctx.status === 404) {
      throw new WrongUrlException()
    }
  } catch (error) {
    if (error instanceof HttpException) {
      // 已知错误，是主动抛出的
      // 针对参数校验错误，它的message应该是由校验类传递过来的，不再通过查询codes配置文件获得
      let message = codes[error.code]
      if (error instanceof ParameterException && error.message) {
        message = JSON.parse(error.message)
      }

      ctx.status = error.status
      ctx.body = {
        code: error.code,
        message,
        request: `${ctx.method} ${ctx.path}`
      }
    } else {
      ctx.status = 500
      ctx.body = {
        code: 9999,
        message: codes[9999],
        request: `${ctx.method} ${ctx.path}`
      }
    }
  }
}

export default catchError
