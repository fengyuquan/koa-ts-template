import { PowerRouter } from '../../lib/router'

const user = new PowerRouter({
  prefix: '/cms/user',
  moduleName: '用户',
  mountPermission: true
})

user.powerGet(
  'userGetAllPermissions',
  '/permissions',
  user.permission('查询自己拥有的所有权限'),
  // loginRequired,
  async (ctx) => {
    ctx.body = '查询自己拥有的所有权限'
  }
)

export default user