// axios 配置文件(配置axios请求的默认基准路径、设置请求/响应拦截器)
// import Vue from 'vue'

// 引入 axios
import axios from 'axios'
// 配置axios请求的根路径 (即 配置axios请求的默认基准路径)
// 老师的api接口 没有完善查询物流信息列表功能
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 大佬的api接口 没有完善根据关键字搜索查询订单列表功能
axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'

// 设置axios请求拦截器
axios.interceptors.request.use(config => {
  // console.log(config)

  // 配置 请求头的Authorization，确保每次请求都携带 token
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})

export default axios
