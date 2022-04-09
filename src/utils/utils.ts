import fs from 'fs'

function assert(ok: boolean, ...args: string[]): void {
  if (!ok) {
    throw new Error(args.join(' '))
  }
}

/**
 * 获取文件夹下所有文件名
 * @param dir 文件夹
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

export { assert, getFiles }
