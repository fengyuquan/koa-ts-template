import { IRouterContext } from 'koa-router'
import { Index, Rule } from './base-validator'

class PositiveIntegerValidator extends Index {
  id: Rule[]
  id1: Rule[]

  constructor(ctx: IRouterContext) {
    super(ctx)
    this.id = [new Rule('isInt', '需要传入正整数', { min: 1 })]
    this.id1 = [new Rule('isInt', '需要传入正整数', { min: 1 })]
  }
}

export { PositiveIntegerValidator }
