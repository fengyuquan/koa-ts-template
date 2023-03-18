import fs from 'fs'

/**
 * 定义一个函数接口，用于查找对象中满足条件的key
 */
interface IFindFunc {
  /**
   * @param obj 函数接收要查找的对象
   * @returns {string[]} 返回满足条件的key数组
   */
  (obj: { [x: string]: any }): string[]
}

/**
 * 定义一个函数接口，用于查找对象中满足条件的key
 */
interface IFindMembersFunc {
  /**
   * @param obj 要查找的对象
   * @param options 查找条件
   * @param options.filter 过滤条件函数
   * @param options.prefix key的前缀
   * @param options.specifiedType 指定的类型
   * @returns {string[]} 返回满足条件的key数组
   */
  (
    obj: { [x: string]: any },
    options: {
      filter?: Function
      prefix?: string
      specifiedType?: any
    }
  ): string[]
}

/**
 * 断言函数，如果ok为false，则抛出一个错误
 * @param ok 断言条件
 * @param args 错误信息
 */
function assert(ok: boolean, ...args: string[]): void {
  if (!ok) {
    throw new Error(args.join(' '))
  }
}

/**
 * 获取指定目录下的所有文件路径
 * @param dir 目录路径
 * @returns {string[]} 返回文件路径数组
 */
function getFiles(dir: string) {
  let res: string[] = []
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const name = dir + '/' + file
    if (fs.statSync(name).isDirectory()) {
      // 如果是文件夹，则递归
      const tmp = getFiles(name)
      res = res.concat(tmp)
    } else {
      res.push(name)
    }
  }
  return res
}

/**
 * 找到obj对象中（包含原型链上的key）满足传入给定条件之一的key，并返回这个key数组
 */
const findMembers: IFindMembersFunc = (
  obj,
  { filter, prefix, specifiedType }
) => {
  // 如果没有传入过滤条件，直接返回空数组
  if (!filter && !prefix && !specifiedType) {
    return []
  }

  // 递归函数
  const _find: IFindFunc = (obj) => {
    // 基线条件（跳出递归）
    if (obj.__proto__ === null) {
      return []
    }

    let keys = Object.getOwnPropertyNames(obj)
    keys = keys.filter((key) => {
      // 过滤掉不满足条件的属性或方法名
      return _shouldKeep(key)
    })

    return [...keys, ..._find(obj.__proto__)]
  }

  /**
   * 当传入的key值满足三个条件之一时，返回true
   * 条件一：如果存在filter，且满足这个传入的filter
   * 条件二：如果存在prefix，且key有这个前缀
   * 条件一：如果存在specifiedType，且obj[key]是这个类型
   * @returns {boolean}
   */
  function _shouldKeep(key: string) {
    return (
      (filter && filter(key)) ||
      (prefix && key.startsWith(prefix)) ||
      (specifiedType && obj[key] instanceof specifiedType)
    )
  }

  return _find(obj)
}

export { assert, getFiles, findMembers }
