<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home/goods'}">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示文本 -->
      <el-row>
        <el-alert title="修改商品信息" type="info" center show-icon :closable="false"></el-alert>
      </el-row>
      <!-- 步骤条 -->
      <el-row>
        <!-- 注意：这里 :active接收数值类型 -->
        <el-steps :space="400" :active="activeStepIndex * 1" finish-status="success" align-center>
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
      </el-row>
      <!-- 表单 -->
      <el-row>
        <el-form :model="editGoodForm" :rules="editGoodFormRules" label-position="top" ref="editGoodFormRef">
          <!-- 标签页 -->
          <!-- 注意：这里 v-model接收字符串类型 -->
          <el-tabs
          :before-leave="beforeTabLeave"
          v-model="activeStepIndex"
          tab-position="left"
          @tab-click="tabClicked"
          >
            <!-- 基本信息面板 -->
            <el-tab-pane label="基本信息" name="0">
              <el-form-item label="商品名称" prop="goods_name">
                <el-input v-model="editGoodForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="editGoodForm.goods_price"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="editGoodForm.goods_weight"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="editGoodForm.goods_number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <!-- 级联选择器 -->
                <!-- 注意：v-model绑定的goods_cat数组 记录已选中项的id；options为数据源；props为配置对象，负责配置选项显示或选中的依据-->
                <el-cascader
                show-all-levels
                v-model="editGoodForm.goods_cat"
                :options="categoriesList"
                :props="cascaderProps"
                @change="selectedCateChange"
                clearable
                filterable
                placeholder="可搜索关键字..."
                >
                </el-cascader>
              </el-form-item>
            </el-tab-pane>
            <!-- 商品参数面板 -->
            <el-tab-pane label="商品参数" name="1">
              <!-- 表单项 -->
              <el-form-item :label="item.attr_name" v-for="item in manyTableList" :key="item.attr_id">
                <!-- 多选框组 注意：v-model双向数据绑定的attr_vals数组，负责复选框的显示文本与标识 -->
                  <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox :label="val" v-for="(val, i) in item.attr_vals" :key="i" border></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <!-- 商品属性面板 -->
            <el-tab-pane label="商品属性" name="2">
              <!-- 表单项 -->
              <el-form-item :label="item.attr_name" v-for="item in onlyTableList" :key="item.attr_id">
                <el-input v-model="item.attr_vals" ></el-input>
              </el-form-item>
            </el-tab-pane>
            <!-- 商品图片面板 -->
            <el-tab-pane label="商品图片" name="3">
              <!-- 上传图片 注意：action表示图片上传的绝对路径，到后台服务器的api地址 -->
              <!-- 注意：上传组件自封装了ajax请求，所以没有调用自定义的axios，故而没有在请求头携带token -->
              <!-- 注意：上传图片成功后，图片只是存放在后台服务器，需要把该图片在服务器的相对存放地址记录下来，并作为表单数据的一部分保存，与该条商品数据关联起来，这样做在后续展示该商品数据时，就能找到对应的图片进行展示 -->
              <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
              :file-list="uploadedList"
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-tab-pane>
            <!-- 商品内容面板 -->
            <el-tab-pane label="商品内容" name="4">
              <!-- Vue富文本编辑器 -->
              <quill-editor
              v-model="editGoodForm.goods_introduce"
              />
              <!-- 添加商品提交按钮 -->
              <el-button type="primary" @click="editGood" :style="{marginTop: '15px'}">确认修改</el-button>
            </el-tab-pane>
          </el-tabs>

        </el-form>
      </el-row>
    </el-card>

    <!-- 预览图片对话框 -->
    <el-dialog  title="预览图片" :visible.sync="previewPictureDialogVisible" width="50%">
      <!-- 预览图片 -->
      <img :src="previewPath" class="previewImg"/>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
// 引入相应的请求api
import { getCategoriesByTypeRequest, getGoodRequest, editGoodRequest } from '../../api'
// 引入 lodash 库
import _ from 'lodash'
export default {
  data () {
    return {
      // 记录当前要修改商品id，通过路由参数接收
      goodId: parseInt(this.$route.params.id),
      // 修改商品表单的数据绑定对象
      editGoodForm: {
        // 商品id
        goods_id: '',
        // 商品名称
        goods_name: '',
        // 商品价格
        goods_price: '',
        // 商品重量
        goods_weight: '',
        // 商品数量
        goods_number: '',
        // 商品所属分类id
        cat_id: '',
        cat_one_id: '',
        cat_two_id: '',
        cat_three_id: '',
        // 商品所属分类id字符串 处理过后就是 级联选择器识别选中项id的数组
        // 注意：这样会使级联选择器初始化选中项文本不会显示
        // goods_cat: '1,45,65',
        goods_cat: [],
        // 商品动态参数、静态属性数据列表 和 拼接后的字符串
        attrs: [
          {
            goods_id: '',
            add_price: null,
            attr_id: '',
            attr_name: '',
            attr_sel: '',
            attr_write: '',
            attr_value: '',
            attr_vals: []
          }
        ],
        // 每张上传成功商品图片信息数组
        pics: [
          // { pics_id: 4580, goods_id: 928, pics_big: '/uploads/goodspics/big_12e96e0e1b60f72b3306945bbb7f4dc4.jpg', pics_mid: '/uploads/goodspics/mid_12e96e0e1b60f72b3306945bbb7f4dc4.jpg', pics_sma: '/uploads/goodspics/sma_12e96e0e1b60f72b3306945bbb7f4dc4.jpg', pics_big_url: 'http://127.0.0.1:8888/uploads/goodspics/big_12e96e0e1b60f72b3306945bbb7f4dc4.jpg', pics_mid_url: 'http://127.0.0.1:8888/uploads/goodspics/mid_12e96e0e1b60f72b3306945bbb7f4dc4.jpg', pics_sma_url: 'http://127.0.0.1:8888/uploads/goodspics/sma_12e96e0e1b60f72b3306945bbb7f4dc4.jpg' }
        ],
        // 富文本编辑器关联的数据内容
        goods_introduce: '',
        // 添加创建的时间
        add_time: '',
        // 删除时间
        delete_time: null,
        // 修改更新时间
        upd_time: '',
        goods_big_logo: '',
        goods_small_logo: '',
        // 商品状态
        goods_state: null,
        hot_mumber: '',
        is_del: '',
        is_promote: false
      },
      // 修改商品表单的规则验证对象
      editGoodFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择三级商品分类', trigger: 'change' }
        ]
      },
      // 记录当前激活面板与同步的步骤条，默认激活第一个面板，第一个步骤
      activeStepIndex: '0',
      // 商品分类数据列表
      categoriesList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        // 指定各选项所依据的标识值
        value: 'cat_id',
        // 指定各选项所依据的显示文本
        label: 'cat_name',
        // 指定各选项的子项所依据的标识值
        children: 'children',
        // 子选项的展开方式
        expandTrigger: 'hover'
      },
      // 当前商品数据 拥有的动态参数数据列表
      manyTableList: [],
      // 当前商品数据 拥有的静态属性数据列表
      onlyTableList: [],
      // 图片上传的路径，即上传图片到后台服务器的api地址
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置上传图片组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 控制 预览图片对话框的显示
      previewPictureDialogVisible: false,
      // 当前将要预览图片在后台服务器的绝对地址
      previewPath: '',
      // 上传成功的小图片数据列表(包含)
      uploadedList: []
    }
  },
  created () {
    this.getGood()
    this.getCategories()
  },
  methods: {
    // 获取商品分类数据列表
    async getCategories () {
      // 获取所有商品分类数据列表       不传参默认获取所有层级的商品分类数据
      const {data: res} = await getCategoriesByTypeRequest()
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      // 请求成功
      this.categoriesList = res.data
    },
    // 根据指定商品id获取商品数据
    async getGood () {
      const {data: res} = await getGoodRequest(this.goodId)
      if (res.meta.status !== 200) return this.$message.error('获取商品数据失败！')
      // console.log(res.data)
      // 请求成功，对响应数据进行预处理
      // 注意：这里响应数据的attrs数组有重复数据
      // 数组去重
      res.data.attrs = this.uniqueFun(res.data.attrs, res.data.attrs.attr_id)
      // 对去重之后的attrs进行预处理，方便后面表单项依据动态参数、静态属性数据列表进行渲染
      res.data.attrs.map(item => {
        if (item.attr_sel === 'many') {
          // 动态参数
          // 对每条动态实参数中的attr_vals进行预处理，方便后面动态参数面板的渲染
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          // 压入动态参数数据列表
          this.manyTableList.push(item)
        } else {
          // 静态属性
          // 对每条静态属性中的attr_vals进行预处理，方便后面静态属性的渲染
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(',')
          // 压入静态属性数据列表
          this.onlyTableList.push(item)
        }
      })
      this.editGoodForm = res.data
      // 设置级联选择器的绑定值
      // 对响应数据的goods_cat进行预处理，方便后面级联选择器识别选中项
      const tempArr = res.data.goods_cat.split(',').map(item => item * 1)
      // 💥注意：由于在Vue中数组的深度监听性，这里应该将goods_cat数组清空再重新push才可监听到变化，级联选择器才能识别选中项回显
      this.editGoodForm.goods_cat = []
      tempArr.map(item => this.editGoodForm.goods_cat.push(item))
      // 对editForm的pics进行处理，方便后面上传组件的已上传图片的渲染
      this.editGoodForm.pics.map(picInfo => {
        // 包含之前上传成功图片的小图在后台服务器绝对地址的图片信息对象
        const pic = {
          name: `${picInfo.pics_id}.jpg`,
          url: picInfo.pics_sma_url
        }
        // 压入已上传图片数据列表
        this.uploadedList.push(pic)
      })
    },
    // 数组去重
    uniqueFun (arr, uniId) {
      const res = new Map()
      return arr.filter(item => !res.has(item[uniId]) && res.set(item[uniId], 1))
    },
    // 监听 级联选择器选中项变化的回调
    selectedCateChange () {
      if (this.editGoodForm.goods_cat.length !== 3) {
        // 用户选择了一、二级分类，清空数组，级联选择器不显示选中项路径文本
        this.editGoodForm.goods_cat = []
      }
    },
    // 监听 标签页面板切换前 的回调  面板切换就会自动监听执行
    beforeTabLeave (newActiveName, oldActiveName) {
      // 当前若是从基本信息面板跳转到别的面板并且没有选中三级分类时，禁止标签页切换
      if (oldActiveName === '0' && this.editGoodForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类后再尝试切换！')
        // 阻止标签页切换
        return false
      }
    },
    // 监听 标签页切换哪个面板 的回调
    tabClicked () {
      // 切换到商品参数面板
      if (this.activeStepIndex === '1') {
        // console.log(this.manyTableList)
        // 及时更新动态参数数据列表的每一项，将每一个动态参数的attr_value字符串与attr_vals数组同步，方便后面的修改请求
        // 💥注意：这里看似修改了动态参数数据列表，其实是修改了editGoodForm的attrs数组(两者同时指向同一存储空间)
        // ！！！注意：用户刷新页面或者重新进入，修改后的数据会丢失
        if (this.manyTableList.length !== 0) {
          this.manyTableList.forEach(item => {
            const newAttrValue = item.attr_vals.join(' ')
            item.attr_value = newAttrValue
          })
        }
      } else if (this.activeStepIndex === '2') {
        // console.log(this.onlyTableList)
        // 同上
        if (this.onlyTableList.length !== 0) {
          this.onlyTableList.forEach(item => {
            const newAttrValue = item.attr_vals.join(' ')
            item.attr_value = newAttrValue
          })
        }
      }
    },
    // 监听 图片预览 的回调  图片预览时会自动执行该回调
    handlePreview (file) {
      // console.log(file)
      // 注意：存在两种情况，一种是之前添加页面上传的图片；一种是现在修改页面上传的图片
      if (file.response) { // 现在上传的图片
        // 获取将要预览图片的在后台服务器的绝对存放地址
        this.previewPath = file.response.data.url
      } else { // 之前添加页面上传的图片
        // 获取将要预览图片在后台服务器的绝对存放地址
        this.previewPath = file.url
      }
      // 展示预览图片对话框
      this.previewPictureDialogVisible = true
    },
    // 监听 图片移除 的回调
    handleRemove (file) {
      // console.log(file)
      // 注意：存在两种情况，一种是之前添加页面上传的图片；一种是现在修改页面上传的图片
      if (file.response) { // 现在上传的图片
        // 获取将要删除图片在后台服务器的相对存放地址
        const filePath = file.response.data.tmp_path
        // 在 pics 数组中，找到该图片对应的索引值
        const index = this.editGoodForm.pics.findIndex(picInfo => picInfo.pic === filePath)
        // pics数组调用splice方法，移除该图片信息对象
        this.editGoodForm.pics.splice(index, 1)
      } else { // 之前添加页面上传的图片
        // 获取将要删除图片再后台服务器的绝对存放地址
        const url = file.url
        // 在 pics 数组中，找到该图片对应的索引值
        const index = this.editGoodForm.pics.findIndex(picInfo => picInfo.pics_sma_url === url)
        // pics数组调用splice方法，移除该图片信息对象
        this.editGoodForm.pics.splice(index, 1)
      }
    },
    // 监听 图片上传成功后 的回调  当图片上传成功后会自动执行该回调
    handleSuccess (response) {
      // console.log(response)
      // 包含当前上传成功图片在后台服务器的相对存放地址 的图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 压入 pics 数组
      this.editGoodForm.pics.push(picInfo)
    },
    // 商品内容确认修改按钮的回调
    editGood () {
      // 进行表单统一验证
      this.$refs.editGoodFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        // 验证通过
        // 对请求参数进行预处理
        // 借用lodash库，对editGoodForm进行深拷贝，只对深拷贝出来的新对象进行数据操作，而不去操作原来的editGoodForm
        const deepCloneForm = _.cloneDeep(this.editGoodForm)
        // 处理商品所属分类 将deepCloneForm中的goods_cat拼接成字符串
        deepCloneForm.goods_cat = deepCloneForm.goods_cat.join(',')
        // 发送axios请求 根据指定商品id和相关参数数据修改商品
        const {data: res} = await editGoodRequest(deepCloneForm)
        if (res.meta.status !== 200) return this.$message.error('修改商品失败！')
        // 请求成功
        this.$message.success('修改商品成功！')
        // 跳转路由到商品列表
        this.$router.replace('/home/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .el-checkbox {
    margin: 0 10px 5px 10px;
  }
  #pane-1 {
    .el-form-item {
      margin-bottom: 5px;
    }
  }
  .previewImg {
    width: 100%;
  }
</style>
