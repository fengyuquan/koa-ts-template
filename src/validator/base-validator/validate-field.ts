import { createRuleFieldResult, IRuleFieldResult } from './rule-result'
import { Rule } from './rule'
import { BaseValidator } from './index'

/**
 * 基础的校验器，用于校验一个字段是否符合一组规则。
 * 其中规则数组是由Rule类的实例组成的数组，Rule类是一个校验规则的基类，
 * Rule类包含了校验规则的名称name、校验函数validate、校验函数的参数value等信息。
 */
export class ValidateField {
  rules: Rule[] // 规则数组
  target: BaseValidator // 校验器实例
  field: string // 字段名

  constructor(rules: Rule[], target: BaseValidator, field: string) {
    this.rules = rules
    this.target = target
    this.field = field
  }

  // validate方法用于校验一个值是否符合规则，
  // 如果符合规则则返回一个RuleFieldResult实例，
  // 否则返回一个包含错误信息的RuleFieldResult实例。
  validate(value: any): IRuleFieldResult {
    // 如果字段为空，表示前端未传入这个参数。接下来需要判断该参数是否允许为空，是否有默认值
    if (value == null) {
      const allowEmpty = this._allowEmpty()
      const defaultValue = this._hasDefault()

      if (allowEmpty) {
        if (!defaultValue) {
          throw new Error(
            `${this.target.constructor.name}校验器中${this.field}字段没有对可选参数设置默认的参数值！`
          )
        }
        return createRuleFieldResult(true, '', defaultValue)
      } else {
        return createRuleFieldResult(false, '字段是必填参数')
      }
    }

    // 校验
    const filedResult = createRuleFieldResult(false)
    const errorMessages = []
    // 遍历该字段需要校验的所有rule，一一验证
    for (const rule of this.rules) {
      const result = rule.validate(value)
      if (!result.pass) {
        errorMessages.push(result.message)
      }
    }
    if (errorMessages.length !== 0) {
      // 没有全通过
      filedResult.message = errorMessages.join('\n')
    } else {
      // 全通过
      filedResult.pass = true
      filedResult.message = '校验通过'
      filedResult.legalValue = this._convert(value)
    }

    return filedResult
  }

  private _allowEmpty() {
    return this.rules.some((rule) => rule.name === 'isOptional')
  }

  private _hasDefault() {
    return this.rules.find((rule) => rule.name === 'isOptional')?.defaultValue
  }

  private _convert(value: any) {
    for (const rule of this.rules) {
      switch (rule.name) {
        case 'isInt':
          return parseInt(value)
        case 'isFloat':
          return parseFloat(value)
        case 'isBoolean':
          return !!value
      }
    }
    return value
  }
}
