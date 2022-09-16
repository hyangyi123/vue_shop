<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home/orders' }">订单列表</el-breadcrumb-item>
      <el-breadcrumb-item v-if="activeName === 'edit'">修改订单</el-breadcrumb-item>
      <el-breadcrumb-item v-else>订单详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 标签页区域 -->
    <el-tabs v-model="activeName" :tab-click="tabClicked" type="border-card">
      <!-- 修改订单面板 -->
      <el-tab-pane label="修改订单" name="edit">
        <!-- 修改订单的表单 -->
        <el-form :model="editOrderForm" :rules="editOrderFormRules" ref="editOrderFormRef" label-width="100px" width="50%">
          <el-form-item label="订单编号">
            <el-input v-model="editOrderForm.order_number" disabled></el-input>
          </el-form-item>
          <el-form-item label="是否发货" prop="is_send">
            <el-input v-model="editOrderForm.is_send"></el-input>
            <p>0表示未发货，1表示已发货</p>
          </el-form-item>
          <el-form-item label="支付方式">
            <el-input v-model="editOrderForm.order_pay" prop="order_pay"></el-input>
            <p>0表示未支付，1表示支付宝，2表示微信，3表示银行卡</p>
          </el-form-item>
          <el-form-item label="发票抬头">
            <el-input v-model="editOrderForm.order_fapiao_title"></el-input>
            <p>个人或者公司</p>
          </el-form-item>
          <el-form-item label="发票内容">
            <el-input v-model="editOrderForm.order_fapiao_content"></el-input>
          </el-form-item>
          <el-form-item label="公司名称">
            <el-input v-model="editOrderForm.order_fapiao_company"></el-input>
          </el-form-item>
          <el-form-item label="订单价格">
            <el-input v-model="editOrderForm.order_price" type="number"></el-input>
          </el-form-item>
          <el-button type="primary" @click="editOrder">修改订单</el-button>
        </el-form>
      </el-tab-pane>
      <!-- 订单详情面板 -->
      <el-tab-pane label="订单详情" name="detail">
        <!-- 订单详情的表格 -->
        <el-table :data="goodsInfo" show-summary :summary-method="getSummaries" stripe border>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="商品图片" align="center">
            <!-- 作用域插槽，自定义渲染 -->
            <template v-slot="{ row }">
              <el-image fit="cover" :src="row.pics[0].pics_sma_url" style="width: 100px; height: 100px"></el-image>
            </template>
          </el-table-column>
          <el-table-column label="商品名称" prop="goods_name" min-width="120px" align="center"></el-table-column>
          <el-table-column label="售价" prop="goods_price" align="center"></el-table-column>
          <el-table-column label="重量" prop="goods_weight" align="center"></el-table-column>
          <el-table-column label="数量" prop="goods_number" align="center"></el-table-column>
          <el-table-column label="总重" align="center">
            <template v-slot="{ row }">
              {{ row.goods_number * row.goods_weight }}
            </template>
          </el-table-column>
          <el-table-column label="总价" align="center">
            <template v-slot="{ row }">
              {{ row.goods_number * row.goods_price }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script type="text/ecmascript-6">
// 引入对应的请求api
import { getOrderRequest, editOrderRequest, getGoodRequest } from '../../api'
export default {
  data () {
    // 自定义校验规则，处理用户不按规定输入
    // 校验是否发货
    const validateSend = (rule, value, callback) => {
      if (value === '是' || value === '1' || value === '已发货') {
        this.editOrderForm.is_send = '1'
        return callback()
      } else if (value === '否' || value === '0' || value === '未发货') {
        this.editOrderForm.is_send = '0'
        return callback()
      } else {
        return callback(new Error('请按规则填写！'))
      }
    }
    // 校验支付方式
    const validatePay = (rule, value, callback) => {
      if (value === '0' || value === '未支付') {
        this.editOrderForm.order_pay = '0'
        return callback()
      } else if (value === '1' || value === '支付宝') {
        this.editOrderForm.order_pay = '1'
        return callback()
      } else if (value === '2' || value === '微信') {
        this.editOrderForm.order_pay = '2'
        return callback()
      } else if (value === '3' || value === '银行卡') {
        this.editOrderForm.order_pay = '3'
        return callback()
      } else {
        return callback(new Error('请按规则填写！'))
      }
    }
    return {
      // 记录当前要修改订单id，通过路由传参接收
      orderId: parseInt(this.$route.params.id),
      // 修改订单面板的
      // 修改订单表单的数据绑定对象
      editOrderForm: {
        // 订单id
        id: '',
        // 订单编号
        order_number: '',
        // 是否发货  1:已经发货，0:未发货
        is_send: '',
        // 支付方式  0 未支付 1 支付宝 2 微信 3 银行卡
        order_pay: '',
        // 订单价格
        order_price: '',
        // 支付状态   0 未付款，1 已付款
        pay_status: '',
        // 发票抬头  个人，公司
        order_fapiao_title: '',
        // 发票公司
        order_fapiao_company: '',
        // 发票内容
        order_fapiao_content: '',
        // 发货地址
        consignee_addr: '',
        // 订单创建时间
        create_time: '',
        // 订单更新时间
        update_time: '',
        // 当前订单下的商品数据列表
        goods: [
          // {
          //     id: 82,
          //     order_id: 67,
          //     goods_id: 96,
          //     goods_price: 333,
          //     goods_number: 2,
          //     goods_total_price: 999
          // },
        ]
      },
      // 修改订单表单的规则验证对象
      editOrderFormRules: {
        is_send: [
          { validator: validateSend, trigger: 'blur' }
        ],
        order_pay: [
          { validator: validatePay, trigger: 'blur' }
        ]
      },
      // 标签页激活面板名称
      activeName: 'edit',
      // 订单详情面板的
      // 当前订单数据goods列表(里面包含了商品id，但是没有完整的商品数据)
      goods: [],
      // 订单详情表格的数组(通过goods列表的每个goods_id获取详细的商品数据)
      goodsInfo: []
    }
  },
  mounted () {
    this.getOrder()
  },
  methods: {
    // 根据路由传入的订单id获取对应的订单数据
    async getOrder () {
      // 发送axios请求 根据指定订单id获取订单数据
      const {data: res} = await getOrderRequest(this.orderId)
      if (res.meta.status !== 200) return this.$message.error('获取订单数据失败！')
      // console.log(res.data)
      // console.log(res.data.goods)
      // 请求成功
      this.editOrderForm = res.data
      // 更新当前订单数据goods列表(里面包含了商品id，但是没有完整的商品数据)
      this.goods = res.data.goods

      // 根据goods列表中每个goods_id，获取对应商品数据，压入goodsInfo列表
      this.goods.map(async (item, index) => {
        // 发送axios请求，根据指定商品id获取商品数据
        const {data: res} = await getGoodRequest(item.goods_id)
        // console.log(res)
        if (res.meta.status !== 200) return this.$message.error('获取商品数据失败')
        // 由于数据不准确，用订单下当前商品的购买数量替换掉库存，即舍弃订单下的goods中商品价格与总价，只取购买数量
        res.data.goods_number = item.goods_number
        // 压入商品详情数组
        this.goodsInfo.push(res.data)
      })
    },
    // 修改订单按钮的回调
    editOrder () {
      // 表单进行统一校验
      this.$refs.editOrderFormRef.validate(async (valid) => {
        if (!valid) return this.$message.error('请正确填写表单项！')
        // 发送axios请求  根据指定订单id和相关参数修改订单数据
        const {data: res} = await editOrderRequest(this.editOrderForm)
        if (res.meta.status !== 201) return this.$message.error('修改订单数据失败！')
        // 请求成功
        this.$message.success('修改订单数据成功！')
        // 路由跳转到订单列表页面
        this.$router.replace('/home/orders')
      })
    },
    // 监听 标签页面板切换 的回调
    tabClicked () {
      this.getOrder()
    },
    // 表格选择符合条件的合计项计算
    getSummaries (params) {
      // 整合数据对象
      const { columns } = params
      // 最终返回的合计行数组
      const sums = []
      columns.forEach((column, index) => {
        // 如果是第一列则返回合计二字
        if (index === 0) {
          sums[index] = '总价'
        } else if (index === 6) { // 如果是第七列则返回 计算后的总重
          let sumWeight = 0
          this.goodsInfo.map(item => {
            sumWeight += item.goods_weight * item.goods_number
          })
          sums[index] = `${sumWeight / 1000} 千克`
        } else if (index === 7) { // 如果是第八列则返回 计算后的总价
          let sumPrice = 0
          this.goodsInfo.map(item => {
            sumPrice += item.goods_price * item.goods_number
          })
          sums[index] = `${sumPrice} 元`
        } else { // 其它列
          sums[index] = `-`
        }
      })
      return sums
    }
  }
}
</script>

<style lang="less" scoped>
  p {
    height: 20px;
    line-height: 20px;
    font-size: 12px;
    color: red;
    padding: 0;
    margin: 0;
  }
  .el-form {
    width: 50%;
  }

</style>
