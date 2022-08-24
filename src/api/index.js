// 引入axios
import axios from 'axios'
// 配置axios请求的默认基础路径 （即 配置axios请求的根路径）
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 登录请求api
export const loginRequest = loginForm => axios.post('login', loginForm)
