import { IRouterContext } from 'koa-router'
import { LoginType } from '../lib/enum'
import { BaseValidator, Rule } from './base-validator'

export class RegisterValidator extends BaseValidator {
  username: Rule[]
  email: Rule[]
  password: Rule[]
  confirm_password: Rule[]

  constructor(ctx: IRouterContext) {
    super(ctx)
    this.username = [
      new Rule('isLength', '用户名长度必须在2~20之间', '', { min: 2, max: 20 })
    ]
    this.email = [
      new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱', '')
    ]
    this.password = [
      // Default options:
      // { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1,
      // returnScore: false, pointsPerUnique: 1, pointsPerRepeat: 0.5, pointsForContainingLower: 10,
      // pointsForContainingUpper: 10, pointsForContainingNumber: 10, pointsForContainingSymbol: 10 }
      new Rule(
        'isStrongPassword',
        '密码长度必须大于8位，包含大小写字母、数字和符号',
        ''
      )
    ]
    this.confirm_password = this.password
  }

  validateConfirmPassword(data: any) {
    const { password, confirm_password } = data.body
    if (!password || !confirm_password || password !== confirm_password) {
      throw new Error('两次输入的密码不一致，请重新输入')
    }
  }
}

export class LoginValidator extends BaseValidator {
  username?: Rule[]
  email?: Rule[]
  password: Rule[]

  constructor(ctx: IRouterContext) {
    super(ctx)
    // 优先使用邮箱登陆
    this.email = [
      new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱', '')
    ]
    this.password = [
      new Rule(
        'isStrongPassword',
        '密码长度必须大于8位，包含大小写字母、数字和符号',
        ''
      )
    ]

    // 判断是什么类型登陆
    const loginType = this.get('body.email')
      ? LoginType.Email
      : LoginType.Username
    if (loginType === LoginType.Username) {
      this.username = [
        new Rule('isLength', '用户名长度必须在2~20之间', '', {
          min: 2,
          max: 20
        })
      ]
      this.email = undefined
    }
  }
}
