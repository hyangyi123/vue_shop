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
import Params from '../components/goods/Params.vue'
import Goods from '../components/goods/Goods.vue'
import AddGood from '../components/goods/AddGood.vue'
import EditGood from '../components/goods/EditGood.vue'
import Orders from '../components/orders/Orders.vue'
import EditOrder from '../components/orders/EditOrder.vue'
import Report from '../components/report/Report.vue'

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
      { path: '/home/categories', component: Cate },
      { path: '/home/params', component: Params },
      { path: '/home/goods', component: Goods },
      { path: '/home/goods/add', component: AddGood },
      { path: '/home/goods/edit/:id', component: EditGood },
      { path: '/home/orders', component: Orders },
      { path: '/home/orders/edit/:id', component: EditOrder },
      { path: '/home/reports', component: Report }
    ]
  }

]
