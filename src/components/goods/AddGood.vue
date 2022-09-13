<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/home/goods'}">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 提示文本 -->
      <el-row>
        <el-alert title="添加商品信息" type="info" effect="dark" center show-icon :closable="false"></el-alert>
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
      <!-- 步骤条随着标签页的变化进行步骤关联同步 -->
      <!-- 因为用户只能操作标签页并不操作步骤条，标签页v-model接收字符串类型，而步骤条:active只接受数值类型，所以可在步骤条中将activeStepIndex转为数值类型-->
      <el-row>
        <!-- 表单 -->
        <el-form :model="addGoodForm" :rules="addGoodFormRules" label-position="top" ref="addGoodFormRef">
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
                <el-input v-model="addGoodForm.goods_name"></el-input>
              </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addGoodForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addGoodForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addGoodForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品分类" prop="goods_cat">
                <!-- 级联选择器 -->
                <!-- 注意：v-model绑定的goods_cat数组 记录已选中项的id；options为数据源；props为配置对象，负责配置选项显示或选中的依据-->
                <el-cascader
                v-model="addGoodForm.goods_cat"
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
              >
                <el-button size="small" type="primary">点击上传</el-button>
                <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
              </el-upload>
            </el-tab-pane>
            <!-- 商品内容面板 -->
            <el-tab-pane label="商品内容" name="4">
              <!-- Vue富文本编辑器 -->
              <quill-editor
              v-model="addGoodForm.goods_introduce"
              />
              <!-- 添加商品提交按钮 -->
              <el-button type="primary" @click="addGood" :style="{marginTop: '15px'}">添加商品</el-button>
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
import { getCategoriesByTypeRequest, getParamsListRequest, addGoodRequest } from '../../api'
// 按需引入lodash库
import _ from 'lodash'
export default {
  data () {
    return {
      // 记录 当前激活的面板、步骤下标  默认为'0'，激活第一个面板；默认为0，激活第一个步骤
      activeStepIndex: '0',
      // 添加商品表单的数据绑定对象
      addGoodForm: {
        // 记录商品名称
        goods_name: '',
        // 记录商品价格
        goods_price: 0,
        // 记录商品重量
        goods_weight: 0,
        // 记录商品数量
        goods_number: 0,
        // 记录商品所属分类，同时也为 级联选择器已选中项id组成的数组
        goods_cat: [],
        // 记录 与当前商品数据所关联的 每张上传成功图片在服务器的相对存放地址，这样做在后续展示该商品数据时，就能找到对应的图片进行展示
        pics: [],
        // 记录商品详情描述
        goods_introduce: '',
        // 记录处理后的商品动态参数、静态属性数据列表
        attrs: []
      },
      // 添加商品表单的规则验证对象
      addGoodFormRules: {
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
      // 动态参数数据列表
      manyTableList: [],
      // 静态属性数据列表
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
      previewPath: ''
    }
  },
  created () {
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
    // 监听 级联选择器选中项变化 的回调  只要选中项发生变化这个回调就会执行，同时记录选中项id的数组也会及时更新
    selectedCateChange () {
      // console.log(this.addGoodForm.goods_cat)
      // 通过 选中项id组成的数组，来判断用户选择哪个层级的商品分类
      if (this.addGoodForm.goods_cat.length !== 3) {
        // 选择了一、二级分类
        // 清空数组，使级联选择器不显示已选项
        this.addGoodForm.goods_cat = []
      }
      // 三级分类下，可进行操作
    },
    // 监听 标签页面板切换前 的回调  在标签页面板发生切换之前执行该回调
    beforeTabLeave (newActiveName, oldActiveName) {
      // console.log(`即将离开的标签页: ${oldActiveName}`)
      // console.log(`即将切换到的标签页: ${newActiveName}`)

      // 当前若是从基本信息面板跳转到别的面板并且没有选中三级分类时，禁止标签页切换
      if (oldActiveName === '0' && this.addGoodForm.goods_cat.length !== 3) {
        this.$message.error('请选择商品分类后再尝试切换！')
        // 阻止标签页切换
        return false
      }
    },
    // 监听 标签页面板被点击 的回调
    async tabClicked () {
      // console.log(this.activeStepIndex)
      // 当前激活、访问的面板是商品参数，对应步骤二
      if (this.activeStepIndex === '1') {
        // 发送axios请求 根据指定三级商品分类id和sel参数，获取动态参数数据列表
        const {data: res} = await getParamsListRequest(this.threeLevelCateId, 'many')
        if (res.meta.status !== 200) return this.$message.error('获取动态参数列表失败！')
        // 请求成功
        // 处理每条动态参数数据的参数项字符串
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length ? (item.attr_vals.indexOf(',') ? item.attr_vals.split(',') : item.attr_vals.split(' ')) : []
        })
        // 更新动态参数数据列表
        this.manyTableList = res.data
        // console.log(this.manyTableList)
      } else if (this.activeStepIndex === '2') {
        // 当前激活、访问的面板是商品属性，对应步骤3
        // 发送axios请求 根据指定三级商品分类id和sel参数，获取静态属性数据列表
        const {data: res} = await getParamsListRequest(this.threeLevelCateId, 'only')
        if (res.meta.status !== 200) return this.$message.error('获取静态属性列表失败！')
        // 请求成功
        // 更新静态属性数据列表
        this.onlyTableList = res.data
        console.log(this.onlyTableList)
      }
    },
    // 监听 图片预览 的回调  图片预览时会自动执行该回调
    handlePreview (file) {
      // console.log(file)
      // 获取将要预览图片的在后台服务器的绝对存放地址
      this.previewPath = file.response.data.url
      // 展示预览图片对话框
      this.previewPictureDialogVisible = true
    },
    // 监听 图片移除 的回调
    handleRemove (file) {
      // console.log(file)

      // 获取将要删除图片在后台服务器的相对存放地址
      const filePath = file.response.data.tmp_path
      // 在 pics 数组中，找到该图片对应的索引值
      const index = this.addGoodForm.pics.findIndex(picInfo => picInfo.pic === filePath)
      // pics数组调用splice方法，移除该图片信息对象
      this.addGoodForm.pics.splice(index, 1)

      // console.log(this.addGoodForm.pics)
    },
    // 监听 图片上传成功后 的回调  当图片上传成功后会自动执行该回调
    handleSuccess (response) {
      // console.log(response)
      // 包含当前上传成功图片在后台服务器的相对存放地址 的图片信息对象
      const picInfo = {
        pic: response.data.tmp_path
      }
      // 压入 pics 数组
      this.addGoodForm.pics.push(picInfo)
      // console.log(this.addGoodForm.pics)
    },
    // 商品内容面板中 添加商品按钮的回调
    addGood () {
      // 进行表单统一验证
      this.$refs['addGoodFormRef'].validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项！')
        // 验证通过
        // 对请求参数进行预处理
        // 注意：这里如果直接操作addGoodForm的goods_cat，会报错，因为级联选择器记录选中项id的goods_cat只接受数组，而请求参数中goods_cat要求是字符串，故而直接修改会导致冲突
        /// ❤️借用lodash库，对addGoodForm进行深拷贝，只对拷贝出来的新对象进行数据操作，而不操作原来的addGoodForm
        const deepCloneForm = _.cloneDeep(this.addGoodForm)
        // 处理商品所属分类 将deepCloneForm中的goods_cat拼接成字符串
        deepCloneForm.goods_cat = deepCloneForm.goods_cat.join(',')
        // 处理动态参数数据列表
        this.manyTableList.map(item => {
          // 处理每条动态参数数据
          const newParamsInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          deepCloneForm.attrs.push(newParamsInfo)
        })
        // 处理静态属性数据列表
        this.manyTableList.map(item => {
          // 处理每条静态属性数据
          const newParamsInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          deepCloneForm.attrs.push(newParamsInfo)
        })
        // 发送axios请求 添加商品数据
        const {data: res} = await addGoodRequest(deepCloneForm)
        if (res.meta.status !== 201) return this.$message.error('添加商品失败！')
        // 请求成功
        this.$message.success('添加商品成功！')
        // 跳转到商品列表
        this.$router.replace('/home/goods')
      })
    }
  },
  computed: {
    'threeLevelCateId': {
      get () {
        if (this.addGoodForm.goods_cat.length === 3) {
          // 选中的是三级分类，返回三级分类的id
          return this.addGoodForm.goods_cat[this.addGoodForm.goods_cat.length - 1]
        }
        // 选中的是 一、二级分类
        return null
      }
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
