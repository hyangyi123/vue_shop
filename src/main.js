import Vue from 'vue'
import App from './App.vue'
// 导入全局样式表
import './assets/css/global.css'
// 引入路由
import router from './router'
// 这里全局按需引入可能是插件冲突原因，暂时用全局完全引入
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// // 这里也可以通过写api模块封装axios请求 直接引入相应请求api即可
// // 引入axios
// import axios from 'axios'
// // 配置axios请求的根路径（即 配置axios请求的默认基础路径）
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// // 将axios挂载到Vue原型对象上
// Vue.prototype.$http = axios

// 使用use加载ElementUI的全部组件，挂载到全局
Vue.use(ElementUI)

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  // 分配路由
  router
})
