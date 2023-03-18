import { IRouterContext } from 'koa-router'
import _ from 'lodash'
import { ParameterException } from '../../exception'
import { findMembers } from '../../utils'
import { Rule } from './rule'
import { createRuleFieldResult } from './rule-result'
import { ValidateField } from './validate-field'

export * from './rule'
export * from './rule-result'
export * from './validate-field'

/**
 * 自定义参数验证器，所有具体的参数验证器(XxxValidator)必须继承该类，并按照规定的格式书写成员变量
 * 规则一：
 *     "需要验证的成员变量" 比如需要验证 name，则this.name = [new Rule(), ...],
 *     需要传入一个Rule实例对象的数组，数组所有元素必须为Rule的实例对象，具体Rule可定义的名称，参考validator.js
 *     this.xxx = [
 *       new Rule(name, message, defaultValue, options),
 *       new Rule(...),
 *       ...
 *     ]
 * 规则二：
 *     可定义自定义的验证方法，方法名需要以validate为方法名前缀。
 *     校验失败时，自定义的校验方法应该抛出错误
 *     校验成功时，必须返回校验后的值。
 *     例如 function validatePassword() {}
 */
export class BaseValidator {
  params!: Object // 请求传递的参数
  paramsChecked!: {
    // 校验后的参数值，供get方法访问使用
    default?: any
    [key: string]: any
  }
  memberKeys!: string[]; // 需要校验的成员变量

  [key: string]: any

  constructor(ctx: IRouterContext) {
    // 解析传递的参数，就是把body，query，params，header各自分类
    this.initParams(ctx)
  }

  /**
   * 从ctx中找到所有前端传递过来的参数
   */
  private initParams(ctx: IRouterContext) {
    this.params = _.cloneDeep({
      body: ctx.request.body,
      query: ctx.request.query,
      params: ctx.params,
      header: ctx.request.header
    })
    this.paramsChecked = _.cloneDeep(this.params)
  }

  /**
   * 最关键发方法，用于验证参数
   * 使用async的原因是考虑到一些自定义验证方法中可能存在异步操作
   */
  async validate(): Promise<BaseValidator> {
    // 1 找到this中所有满足规则1,2的key数组
    this.memberKeys = findMembers(this, {
      filter: this._findMembersFilter.bind(this)
    })

    // 2 校验每一个规则
    const errorMessages: string[] = []

    // 校验：通过Relu实例对象和自定义validate方法
    // 验证通过会返回this，没有则抛出参数校验错误
    for (const memberKey of this.memberKeys) {
      const result = await this._check(memberKey)
      if (!result.success) {
        errorMessages.push(result.message)
      }
    }
    if (errorMessages.length !== 0) {
      throw new ParameterException(JSON.stringify(errorMessages))
    }

    return this
  }

  /**
   * 获取已校验过的参数值, 或原始参数值
   * @param path, 以"." 作为分隔符传入的路径，例如 a.b.c
   * @param parsed, 表明是否是已处理过的对象，默认true
   * @returns {string|any}
   */
  get(path: string, parsed = true) {
    if (parsed) {
      // _.get(object, path, [defaultValue]), https://www.lodashjs.com/docs/lodash.get
      // 根据 object 对象的path路径获取值。 如果解析 value 是 undefined 会以 defaultValue 取代。
      const value = _.get(this.paramsChecked, path, null)

      if (!value) {
        // _.last(array), 获取array中的最后一个元素。 https://www.lodashjs.com/docs/lodash.last
        return _.get(
          this.paramsChecked.default,
          <string>_.last(path.split('.'))
        )
      }
      return value
    } else {
      return _.get(this.params, path)
    }
  }

  private async _check(key: string) {
    const param = this._findParam(key) // 找到前端传入的对应名称的参数值，比如 {name: 'jyyiii'}
    const rules = this[key] // 属性验证，是数组，内有一组Rule或者自定义校验函数

    let result = {
      message: '',
      success: false
    }
    let ruleResult // 校验结果

    // 判断是否是标准的函数，用于自定义的以validate开头的校验函数
    const isCustomFunc = typeof rules === 'function'
    if (isCustomFunc) {
      // 校验失败时，自定义的校验方法应该抛出错误，通过是否捕获到错误，返回校验结果
      try {
        const legalValue = await this[key](this.params)
        ruleResult = createRuleFieldResult(true, '校验成功', legalValue) // 校验成功
      } catch (error) {
        ruleResult = createRuleFieldResult(
          false,
          (error as Error).message || '参数错误'
        )
      }
    } else {
      // 非自定义校验方法，使用第三方库validator.js去校验
      // 字段校验
      ruleResult = new ValidateField(rules, this, key).validate(param.value)
    }

    // 校验通过
    if (ruleResult.pass) {
      // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值
      if (param.path.length === 0) {
        _.set(this.paramsChecked, ['default', key], ruleResult.legalValue)
      } else {
        _.set(this.paramsChecked, param.path, ruleResult.legalValue)
      }

      result = {
        message: 'ok',
        success: true
      }
    } else {
      // 校验未通过
      result = {
        message: ruleResult.message,
        success: false
      }
    }

    return result
  }

  private _findMembersFilter(key: string) {
    // 以validate开头的key保留
    if (/validate([A-Z])\w+/g.test(key)) {
      return true
    }
    // this[key]是数组类型的，数组元素必须全部是Rule实例对象
    if (this[key] instanceof Array) {
      this[key].forEach((v: any) => {
        const isRuleType = v instanceof Rule
        if (!isRuleType) {
          // 这里是参数验证器编写错误，属于服务端错误
          throw new Error(
            `${this.constructor.name}校验器中${key}字段的验证数组必须全部为Rule类型`
          )
        }
      })
      return true
    }
    // 其他类型的key全部过滤掉
    return false
  }

  private _findParam(key: string) {
    const paths = ['query', 'body', 'path', 'header']
    for (const path of paths) {
      const value = _.get(this.params, [path, key])
      if (value) {
        return {
          value,
          path: [path, key]
        }
      }
    }
    return {
      value: null,
      path: []
    }
  }
}
