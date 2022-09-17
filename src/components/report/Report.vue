<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 标签页 -->
      <el-tabs v-model="activeName" @tab-click="tabClicked" type="border-card">
        <!-- 用户来源面板 -->
        <el-tab-pane label="用户来源" name="userOrigin">
          <!-- 1.为 ECharts 准备一个定义了宽高的 DOM 节点-->
          <div id="main1" style="width: 1000px;height:400px;"></div>
        </el-tab-pane>
        <!-- 页面访问量面板 -->
        <el-tab-pane label="页面访问量" name="pageViews">
           <!-- 1.为 ECharts 准备一个定义了宽高的 DOM 节点-->
          <div id="main2" style="width: 1000px;height:400px;"></div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script type="text/ecmascript-6">
// 局部引入Echarts可视化数据工具库
import * as echarts from 'echarts'
// 引入 lodash 库
import _ from 'lodash'
// 引入对应的请求api
import { getReportChart } from '../../api'
export default {
  data () {
    return {
      // 激活面板名称
      activeName: 'userOrigin',
      // 3.设置图表的初始配置项，当获取到数据时，直接合并
      options: {
        title: {
          text: ''
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  // 当所有DOM节点渲染挂载完毕就会执行该钩子
  async mounted () {
    this.getUserOriginChart()
  },
  methods: {
    // 监听 点击面板时切换 的回调
    tabClicked () {
      if (this.activeName === 'userOrigin') {
        this.getUserOriginChart()
      } else {
        this.getPageViewsChart()
      }
    },
    // 获取用户来源折线图表
    async getUserOriginChart () {
      // 2.基于初始化渲染挂载的DOM节点，初始化echarts实例
      const myChart1 = echarts.init(document.getElementById('main1'))
      // 发送axios请求 根据不同type值获取不同类型的折线图表
      const {data: res} = await getReportChart(1)
      if (res.meta.status !== 200) return this.$message.error('获取报表数据失败！')
      // 请求成功
      // 4.使用lodash库 合并配置项数据
      const option = _.merge(this.options, res.data)
      // 5.根据配置项的数据将图表显示在指定echarts实例上
      myChart1.setOption(option)
    },
    // 获取页面访问量折线图表
    async getPageViewsChart () {
      // 2.基于初始化渲染挂载的DOM节点，初始化echarts实例
      const myChart2 = echarts.init(document.getElementById('main2'))
      // 发送axios请求 根据不同type值获取不同类型的折线图表
      const {data: res} = await getReportChart(2)
      if (res.meta.status !== 200) return this.$message.error('获取报表数据失败！')
      // 请求成功
      // 4.使用lodash库 合并配置项数据
      const option = _.merge(this.options, res.data)
      // 5.根据配置项的数据将图表显示在指定echarts实例上
      myChart2.setOption(option)
    }
  }
}
</script>

<style lang="less" scoped>

</style>
