import Vue from 'vue'
import App from './App.vue'
// 导入全局样式表
import './assets/css/global.css'
// 引入路由
import router from './router'
// 这里全局按需引入可能是插件冲突原因，暂时用全局完全引入
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
// 引入Vue树形网格插件
import TreeTable from 'vue-table-with-tree-grid'

// 引入Vue富文本编辑器
import QuillEditor from 'vue-quill-editor'
// 导入Vue富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// // 这里也可以通过写api模块封装axios请求 直接引入相应请求api即可
// // 引入axios
// import axios from 'axios'
// // 配置axios请求的根路径（即 配置axios请求的默认基础路径）
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// // 将axios挂载到Vue原型对象上
// Vue.prototype.$http = axios

// 使用use加载ElementUI的全部组件，挂载到全局
Vue.use(ElementUI)
// 将TreeTable注册为全局组件
Vue.component('tree-table', TreeTable)
// 注册全局过滤器，创建日期时间过滤器，将时间戳格式化
Vue.filter('dateFormat', function (originTime) {
  const dt = new Date(originTime * 1000)
  // 年
  const y = dt.getFullYear()
  // 月           若字符串不足两位，需要在前面补字符'0'
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  // 日
  const d = (dt.getDate() + '').padStart(2, '0')
  // 时
  const hh = (dt.getHours() + '').padStart(2, '0')
  // 分
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  // 秒
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  // 返回处理后的时间字符串
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// 使用use加载Vue富文本编辑器组件，并把它挂载到全局
Vue.use(QuillEditor)

new Vue({
  el: '#app',
  components: { App },
  template: '<App/>',
  // 分配路由
  router
})
