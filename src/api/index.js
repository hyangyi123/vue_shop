// 封装axios请求

// 引入axios配置文件
import axios from './axios_config'

// 登录请求api                                'login'为请求路径
export const loginRequest = loginForm => axios.post('login', loginForm)
// 左侧菜单列表请求api
export const getMenuList = () => axios.get('menus')
