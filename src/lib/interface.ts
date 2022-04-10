import { IRouterContext } from 'koa-router'
import { UserModel } from '../model/user'

interface IUserContext extends IRouterContext {
  currentUser: UserModel | null
}
export { IUserContext }
