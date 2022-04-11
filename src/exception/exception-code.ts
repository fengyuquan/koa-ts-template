const codes: { [key: string]: string } = {}

codes[0] = 'ok'
codes[9999] = '服务器未知异常'

// 通用错误
codes[10001] = '通用错误'
codes[10002] = '通用参数校验错误'

// 登陆，身份校验
codes[20001] = '身份认证失败'
codes[20002] = '用户未被授权'
codes[20003] = '令牌失效或损坏'
codes[20004] = '令牌已过期'
codes[20005] = '用户不存在'
codes[20006] = '用户密码错误'

// 请求资源相关
codes[30001] = '资源找不到'
codes[30002] = '请求地址不存在'

export default codes
