// 路由配置文件
// 引入路由的管理组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
export default [
  // 路由重定向
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },

  // // 写法一
  // {
  //   path: '/home',
  //   redirect: '/home/welcome'
  // },
  {
    path: '/home',
    component: Home,
    // 写法二：得先匹配'/home'到Home组件渲染 再去路由重定向'/home/welcome'到子组件
    redirect: '/home/welcome',
    children: [
      { path: '/home/welcome', component: Welcome }
    ]
  }

]
