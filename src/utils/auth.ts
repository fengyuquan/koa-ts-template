import { IUserContext } from '../lib/interface'
import { GroupLevel } from '../lib/type'
import { GroupModel } from '../model/group'
import { UserModel } from '../model/user'
import { UserGroupModel } from '../model/user-group'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getIdFromToken(ctx: IUserContext) {
  // TODO 从上下文中拿到token，并解析token，返回用户的id
  const id = 1
  return id
}

/**
 * 将 user 挂在 ctx 上，有验证用户是否存在的功能
 */
async function mountUser(ctx: IUserContext) {
  const id = getIdFromToken(ctx)
  const user = await UserModel.findByPk(id)
  if (!user) {
    // TODO 抛出用户不存在的错误
    throw new Error('用户不存在')
  }

  // 将user挂在ctx上
  ctx.currentUser = user
}

/**
 * 判断操作的用户是否是超级管理员
 * 超级管理员只属于root这一个组
 */
async function isRootAdmin(userId: number) {
  const userGroup = await UserGroupModel.findOne({
    where: {
      user_id: userId
    }
  })
  if (!userGroup) {
    // TODO 抛出找不到该用户用户所属的组
    throw new Error('找不到')
  }
  const group = await GroupModel.findByPk(userGroup.group_id)
  if (!group) {
    // TODO 抛出找不到该用户组
    throw new Error('找不到')
  }
  if (group.level === GroupLevel.Root) {
    return true
  } else {
    return false
  }
}

export { mountUser, isRootAdmin }
