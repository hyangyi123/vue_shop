// 路由配置文件
// 引入路由的对应组件
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
// 引入子组件
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'

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
    // 写法二：得先匹配'/home'到Home组件渲染 再去路由重定向'/home/welcome'到Welcome子组件
    redirect: '/home/welcome',
    children: [
      { path: '/home/welcome', component: Welcome },
      // 注意：由于左侧菜单栏对应各个组件是作为子组件嵌套到首页的el-main去显示，所以都必须作为'/home'的子路由
      { path: '/home/users', component: Users },
      { path: '/home/rights', component: Rights },
      { path: '/home/roles', component: Roles },
      { path: '/home/categories', component: Cate }
    ]
  }

]
