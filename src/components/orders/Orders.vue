<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索 -->
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryObj.query" @change="getOrders" clearable @clear="getOrders" placeholder="请输入内容">
            <el-button slot="append" @click="getOrders" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单数据列表 表格显示 -->
      <el-row>
        <el-table :data="ordersList" border stripe>
          <el-table-column type="index" align="center"></el-table-column>
          <el-table-column label="订单编号" prop="order_number" align="center" min-width="110px"></el-table-column>
          <el-table-column label="订单价格" prop="order_price" align="center" width="90px"></el-table-column>
          <el-table-column label="是否付款" align="center" width="90px">
            <template v-slot="{ row }">
              <el-tag v-if="row.order_pay === '0'" type="danger">未付款</el-tag>
              <el-tag type="success" v-else>已付款</el-tag>
             </template>
          </el-table-column>
          <el-table-column label="是否发货" prop="is_send" align="center" width="90px"></el-table-column>
          <el-table-column label="下单时间" prop="create_time" align="center" width="100px">
             <template v-slot="{ row }">
              {{ row.create_time | dateFormat }}
             </template>
          </el-table-column>
          <el-table-column label="发货地址" prop="consignee_addr" align="center">
          </el-table-column>
          <el-table-column label="操作" align="center" min-width="100px">
            <template v-slot="{ row }">
              <el-tooltip :enterable="false" effect="dark" content="查看/修改订单" placement="top">
                <el-button @click="goEditOrderPage(row.order_id)" type="primary" size="mini" icon="el-icon-s-order"></el-button>
              </el-tooltip>
              <el-tooltip :enterable="false" effect="dark" content="物流信息" placement="top">
                <el-button @click="showProcessDialog(row.is_send)" type="success" size="mini" icon="el-icon-location"></el-button>
              </el-tooltip>
              <el-tooltip :enterable="false" effect="dark" content="修改地址" placement="top">
                <el-button @click="showEditAddressDialog(row.order_id)" type="primary" size="mini" icon="el-icon-edit"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <!-- 分页器 -->
      <el-row>
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryObj.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryObj.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        >
        </el-pagination>
      </el-row>
    </el-card>

    <!-- 修改地址对话框 -->
    <el-dialog @close="editAddressDialogClose" title="修改地址" :visible.sync="editAddressDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editAddressForm" :rules="editAddressFormRules" ref="editAddressFormRef" label-width="100px">
        <el-form-item label="省市区/县" prop="region">
          <!-- 级联选择器 注意：:option绑定数据源，v-model双向绑定存放着选中项id的数组-->
          <el-cascader
          placeholder="可搜索地区"
          :options="cityData"
          v-model="editAddressForm.region"
          filterable
          clearable
          >
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="editAddressForm.address"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddress">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流进度对话框 -->
    <el-dialog @close="processDialogClose" title="物流进度" :visible.sync="processDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <!-- 时间线组件 -->
      <el-timeline :reverse="false">
        <el-timeline-item
        v-for="(activity, index) in processList"
        :key="index"
        :timestamp="activity.time"
        >
        {{activity.context}}
        </el-timeline-item>
    </el-timeline>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="processDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
// 引入 相应的请求api
import { getOrdersListRequest, getLogisticsProcessRequest, getOrderRequest,
  editOrderRequest } from '../../api'
// 引入 城市选择器数据列表
import cityData from './citydata.js'
export default {
  data () {
    return {
      // 获取订单数据列表的参数对象
      queryObj: {
        // 查询关键字
        query: '',
        // 当前页码数
        pagenum: 1,
        // 每页大小（即 每页显示多少条商品数据）
        pagesize: 10
      },
      // 商品数据总条数（即 总共有多少条商品数据）
      total: 0,
      // 订单数据列表
      ordersList: [],
      // 控制 修改地址对话框的显示
      editAddressDialogVisible: false,
      // 修改地址表单的数据绑定对象
      editAddressForm: {
        // 记录级联选择器选中项id数组
        region: [],
        // 记录输入框文本值
        address: ''
      },
      // 修改地址表单的规则验证对象
      editAddressFormRules: {
        region: [
          { required: true, message: '请选择地区', trigger: 'change' }
        ],
        address: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      // 城市选择器数据列表
      cityData,
      // 当前指定订单id的订单数据(内含有地址信息)
      orderInfo: {

      },
      // 控制 物流进度对话框的显示
      processDialogVisible: false,
      // 物流信息列表
      processList: []
    }
  },
  created () {
    this.getOrders()
  },
  methods: {
    // 获取订单数据列表
    async getOrders () {
      const {data: res} = await getOrdersListRequest(this.queryObj)
      if (res.meta.status !== 200) return this.$message.error('获取订单列表失败！')
      // console.log(res)
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    // 监听 每页大小(显示数据条数)变化 的回调
    handleSizeChange (newSize) {
      this.queryObj.pagesize = newSize
      this.getOrders()
    },
    // 监听 页码数变化 的回调
    handleCurrentChange (newNum) {
      this.queryObj.pagenum = newNum
      this.getOrders()
    },
    // 修改地址按钮的回调 展示修改地址对话框
    async showEditAddressDialog (orderId) {
      // 发送axios请求 根据指定订单id获取订单数据
      const {data: res} = await getOrderRequest(orderId)
      if (res.meta.status !== 200) return this.$message.error('获取订单数据失败！')
      // 请求成功
      // 更新当前指定订单id的订单数据对象
      this.orderInfo = res.data
      // console.log(this.orderInfo)
      this.editAddressDialogVisible = true
    },
    // 修改地址对话框确定按钮的回调
    async editAddress () {
      // 将修改地址表单数据绑定对象中 地址信息拼接成字符串
      const addressStr = `${this.editAddressForm.region} ${this.editAddressForm.address}`
      this.orderInfo.consignee_addr = addressStr
      // 发送axios请求 根据指定订单id修改订单数据
      const {data: res} = await editOrderRequest(this.orderInfo)
      if (res.meta.status !== 201) return this.$message.error('修改订单地址失败！')
      // 请求成功
      // console.log(res)
      this.$message.success('修改订单地址成功！')
      // 更新订单数据列表 页面刷新渲染
      this.getOrders()
      // 关闭修改地址对话框
      this.editAddressDialogVisible = false
    },
    // 监听 修改地址对话框关闭 的回调
    editAddressDialogClose () {
      // 重置表单
      this.$refs.editAddressFormRef.resetFields()
      this.orderInfo = {}
    },
    // 物流进度按钮的回调 展示物流进度对话框
    async showProcessDialog (isSend) {
      // 如果未发货则无法查询物流信息
      if (isSend === '否') return this.$message.warning('订单未发货，无法查看物流信息！')
      // 发送axios请求 根据指定物流单号获取物流信息  这里写死测试物流单号1106975712662
      const {data: res} = await getLogisticsProcessRequest('1106975712662')
      if (res.meta.status !== 200) return this.$message.error('获取物流进度失败！')
      // 更新物流信息列表
      this.processList = res.data
      // 展示物流进度对话框
      this.processDialogVisible = true
    },
    // 监听 物流进度对话框关闭 的回调
    processDialogClose () {
      // 清空物流信息列表 (多余)
      this.processList = []
    },
    // 修改订单/查看订单详情 按钮的回调
    goEditOrderPage (orderId) {
      // 路由跳转到 修改订单页面
      this.$router.push(`/home/orders/edit/${orderId}`)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
