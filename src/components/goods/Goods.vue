<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索 -->
      <el-row :gutter="30">
        <el-col :span="8">
          <el-input
          v-model="queryObj.query"
          @change="getGoods"
          placeholder="请输入内容"
          clearable
          @clear="getGoods"
          >
            <el-button @click="getGoods" slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
            <el-button @click="goAddGoodPage" type="primary">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 商品数据列表 表格展示 -->
      <el-row>
        <el-table :data="goodsList" border stripe>
          <!-- 索引列 -->
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="goods_name" label="商品名称"></el-table-column>
          <el-table-column prop="goods_price" label="商品价格(元)" align="center" width="105px"></el-table-column>
          <el-table-column prop="goods_weight" label="商品重量" align="center" width="80px"></el-table-column>
          <el-table-column label="创建时间" align="center" width="110px">
            <!-- 通过作用域插槽，进行自定义渲染 -->
            <template v-slot="{ row }">
              {{ row.add_time | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="125px">
            <template v-slot="{ row }">
              <el-button type="primary" @click="goEditGoodPage(row.goods_id)" size="mini" icon="el-icon-edit"></el-button>
              <el-button type="danger" @click="deleteGood(row.goods_id)" size="mini" icon="el-icon-delete"></el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <!-- 分页器区域 -->
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
  </div>
</template>

<script type="text/ecmascript-6">
// 引入相应的请求api
import { getGoodsListRequest, deleteGoodRequest } from '../../api'
export default {
  data () {
    return {
      // 获取商品数据列表的参数对象
      queryObj: {
        // 记录 查询的关键字
        query: '',
        // 记录 当前页码数
        pagenum: 1,
        // 记录 每页大小（即 每页显示多少条商品数据）
        pagesize: 10
      },
      // 记录 商品数据总条数（即 总共有多少条商品数据）
      total: 0,
      // 商品数据列表
      goodsList: []
    }
  },
  created () {
    this.getGoods()
  },
  methods: {
    // 获取所有商品数据列表
    async getGoods () {
      const {data: res} = await getGoodsListRequest(this.queryObj)
      if (res.meta.status !== 200) return this.$message.error('获取商品数据列表失败！')
      console.log(res.data)
      // 请求成功
      this.total = res.data.total
      this.goodsList = res.data.goods
    },
    // 监听 每页大小(每页显示多少条数据)变化 的回调
    handleSizeChange (newSize) {
      this.queryObj.pagesize = newSize
      // 重新获取商品数据列表 页面刷新渲染
      this.getGoods()
    },
    // 监听 页码数(当前要跳转第几页)变化 的回调
    handleCurrentChange (newNum) {
      this.queryObj.pagenum = newNum
      this.getGoods()
    },
    // 删除按钮的回调
    deleteGood (goodId) {
      // 弹出提示弹框
      this.$confirm('确定永久删除该商品数据吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        // 发送axios请求 根据指定商品id删除商品数据
        const {data: res} = await deleteGoodRequest(goodId)
        if (res.meta.status !== 200) return this.$message.error(`删除商品数据失败！`)
        // 请求成功
        this.$message.success(`删除商品数据成功！`)
        // 重新获取商品数据列表 页面刷新渲染
        this.getGoods()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 添加商品按钮的回调
    goAddGoodPage () {
      // 路由对象压入 添加商品页面所对应的路由地址
      this.$router.push('/home/goods/add')
      // console.log(this.$router)
      // window.sessionStorage.setItem('activePath', '/home/addgood')
    },
    // 修改商品按钮的回调
    goEditGoodPage (goodId) {
      // 路由跳转到修改商品页面，同时通过路由传入参数
      this.$router.push(`/home/goods/edit/${goodId}`)
    }
  },
  // 定义局部过滤器
  filters: {
    // // 日期时间过滤器，将时间戳格式化
    // dateFormat: function (originTime) {
    //   const dt = new Date(originTime)
    //   // 年
    //   const y = dt.getFullYear()
    //   // 月
    //   const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    //   // 日
    //   const d = (dt.getDate() + '').padStart(2, '0')
    //   // 时
    //   const hh = (dt.getHours() + '').padStart(2, '0')
    //   // 分
    //   const mm = (dt.getMinutes() + '').padStart(2, '0')
    //   // 秒
    //   const ss = (dt.getSeconds() + '').padStart(2, '0')
    //   // 返回处理后的时间字符串
    //   return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
    // }
  }
}
</script>

<style lang="less" scoped>

</style>
