import Application from 'koa'
import Router from 'koa-router'
import path from 'path'
import config from '../config'
import { getFiles } from '../utils'
import { PermissionModel } from '../model/permission'

class Init {
  static app: Application

  static async initCore(app: Application) {
    Init.app = app
    Init.LoaderRouter() // 注册路由
    await PermissionModel.initPermission() // 初始化权限数据库表
  }

  static LoaderRouter() {
    const apiDirectory = path.normalize(
      `${process.cwd()}/${config.apiDir ?? 'src/api'}`
    )
    const files = getFiles(apiDirectory) // 拿到api目录下所有的文件名
    for (const file of files) {
      const ext = file.substring(file.lastIndexOf('.'))
      if (ext === '.ts') {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const router = require(file).default
        if (router instanceof Router) {
          if (config.env === 'development') {
            console.info(`loading a router instance from file: ${file}`)
          }
          // 注册路由
          Init.app.use(router.routes()).use(router.allowedMethods())
        }
      }
    }
  }
}

export default Init
