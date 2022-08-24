// 路由配置文件
// 引入路由的管理组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
export default [
  // 路由重定向
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home }
]
