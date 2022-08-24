// 路由入口文件

import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './routes'

Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  routes
})

// 设置路由导航守卫
router.beforeEach((to, from, next) => { // 路由对象调用beforeEach()
  // to   将要访问的路径
  // from 从哪个路径跳转而来
  // next 放行函数
  //  ① next() 直接放行   ② next('/路径') 强制跳转

  // 将要访问的为 登录页面 由于登录页面没有权限 所以直接放行
  if (to.path === '/login') return next()

  // 将要访问的是 其它需要权限的页面
  // 获取 token
  const token = window.sessionStorage.getItem('token')
  // token不存在，证明没有登录 >>> 没有权限访问，强制跳转到登录页面
  if (!token) return next('/login')
  // token存在，证明已经登录 >>> 放行
  next()
})

export default router
