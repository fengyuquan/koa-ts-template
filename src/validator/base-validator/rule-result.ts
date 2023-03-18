export interface IRuleResult {
  pass: boolean // 表示验证是否通过
  message: string // 验证结果信息
}

export interface IRuleFieldResult extends IRuleResult {
  legalValue: any // 表示验证通过时的合法值
}

export function createRuleResult(pass: boolean, message = ''): IRuleResult {
  return {
    pass,
    message
  }
}

export function createRuleFieldResult(
  pass: boolean,
  message = '',
  legalValue = null
): IRuleFieldResult {
  return {
    pass,
    message,
    legalValue
  }
}
