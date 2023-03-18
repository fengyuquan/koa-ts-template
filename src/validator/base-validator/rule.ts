import _ from 'lodash'
import validator from 'validator'
import { createRuleResult, IRuleResult } from './rule-result'

/**
 * Rule类是一个校验规则的基类，
 * Rule类包含了校验规则的名称name、校验函数validate等信息。
 */
export class Rule {
  name: string // 规则名称
  message: string // 校验后的提示信息
  defaultValue: any // 如果设置name为isOptional，在校验value未传入时，使用该值，
  options?: {} // 剩余参数，给第三方库validator用的

  constructor(
    name: string,
    message: string,
    defaultValue: any,
    ...options: any[]
  ) {
    this.name = name
    this.message = message
    this.defaultValue = defaultValue
    this.options = options
  }

  validate(value: any): IRuleResult {
    // 可选的规则，遇到这个规则，则直接校验通过。
    if (this.name === 'isOptional') {
      return createRuleResult(true, 'Optional')
    }
    // 调用validator.js 校验，不通过
    if (!_.get(validator, this.name)(value + '', this.options)) {
      return createRuleResult(false, this.message || '参数错误')
    }
    // validator.js 校验通过
    return createRuleResult(true, '校验通过')
  }
}
