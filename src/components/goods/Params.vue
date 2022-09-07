<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告标语区域 -->
      <el-row>
        <el-alert show-icon :closable="false" title="注意：只允许为第三级分类设置相关的参数！" type="warning"></el-alert>
      </el-row>
      <!-- 选择商品分类区域 -->
      <el-row class="cate_option_row" type="flex" align="middle">
        <el-col :span="6">
          <span>请选择要设置参数的商品分类：</span>
        </el-col>
        <el-col :span="16">
          <!-- 级联选择器 -->
          <!-- 注意：options为数据源；v-model绑定的selectedKeys数组记录级联选择器已选分类id；props为配置对象，负责配置每项显示或选中的依据-->
          <el-cascader
          v-model="selectedKeys"
          :options="categoriesList"
          :props="cascaderProps"
          @change="selectedCateChange"
          clearable
          filterable
          placeholder="可搜索关键字..."
          >
          </el-cascader>
        </el-col>
      </el-row>
      <!-- 标签页区域 -->
      <el-row>
        <!-- 注意：双向数据绑定的activeName会自动记录标签页中已激活面板的name值，并会自动切换到该面板 -->
        <el-tabs v-model="activeName" @tab-click="handleTabClick">
          <!-- 动态参数面板 -->
          <el-tab-pane label="动态参数" name="many">
            <el-button :disabled="isBtnDisabled" @click="addParamsDialogVisible = true" type="primary" size="mini">添加参数</el-button>
            <!-- 动态参数的表格显示 -->
            <el-table :data="manyTableList" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template v-slot="{ row }">
                  <!-- 遍历生成tag标签 -->
                  <el-tag
                  v-for="(value, index) in row.attr_vals"
                  closable
                  @close="handleTagClose(index, row)"
                  :key="index"
                  >{{value}}</el-tag>
                  <!-- 新增标签按钮与输入文本框的互相切换 -->
                  <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="{ row }">
                  <el-button @click="showEditParamsDialog(row.attr_id)" size="mini" type="primary" icon="el-icon-edit">修改</el-button>
                  <el-button @click="deleteParams(row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <!-- 静态属性面板 -->
          <el-tab-pane label="静态属性" name="only">
            <el-button :disabled="isBtnDisabled" @click="addParamsDialogVisible = true" type="primary" size="mini">添加属性</el-button>
            <!-- 静态属性的表格显示 -->
             <el-table :data="onlyTableList" border stripe>
              <!-- 展开行 -->
              <el-table-column type="expand">
                <template v-slot="{ row }">
                  <!-- 遍历生成tag标签 -->
                  <el-tag
                  v-for="(value, index) in row.attr_vals"
                  closable
                  @close="handleTagClose(index, row)"
                  :key="index"
                  >{{value}}</el-tag>
<!-- ⭐注意；这里不能直接将 输入框的控制属性 定义在数据对象中。因为会造成 多个展开行的输入框共用同一个控制属性，使所有展开行的输入框发生错误关联 -->
<!-- 正确做法：给每个展开行的各自输入框添加自己的控制属性与记录文本值 => 应该在获取参数数据列表时，对每条参数数据(每个展开行)进行添加 -->
                  <!-- 新增标签按钮与输入文本框的互相切换 -->
                  <el-input
                  class="input-new-tag"
                  v-if="row.inputVisible"
                  v-model="row.inputValue"
                  ref="saveTagInputRef"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(row)"
                  @blur="handleInputConfirm(row)"
                  >
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <!-- 索引列 -->
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="{ row }">
                  <el-button @click="showEditParamsDialog(row.attr_id)" size="mini" type="primary" icon="el-icon-edit">修改</el-button>
                  <el-button @click="deleteParams(row.attr_id)" size="mini" type="danger" icon="el-icon-delete">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          </el-tabs>
      </el-row>
    </el-card>

    <!-- 注意：两个面板 共用一个添加参数对话框 -->
    <!-- 添加参数对话框 -->
    <el-dialog :title="`添加${titleText}`" @close="addParamsDialogClosed" :visible.sync="addParamsDialogVisible" width="50%">
      <el-form :model="addParamsForm" :rules="addParamsFormRules" ref="addParamsFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 注意：两个面板 共用一个修改参数对话框 -->
    <!-- 修改参数对话框 -->
    <el-dialog :title="`修改${titleText}`" @close="editParamsDialogClosed" :visible.sync="editParamsDialogVisible" width="50%">
      <el-form :model="editParamsForm" :rules="editParamsFormRules" ref="editParamsFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
// 引入对应的请求api
import { getCategoriesByTypeRequest, getParamsListRequest, addParamsRequest,
  getParamsRequest, editParamsRequest, deleteParamsRequest, updateParamsRequest } from '../../api'
export default {
  data () {
    return {
      // 所有商品分类数据列表
      categoriesList: [],
      // 记录 级联选择器 已选分类(选中项)id组成的数组
      selectedKeys: [],
      // 级联选择器的配置对象
      cascaderProps: {
        // 指定各选项所依据的标识值
        value: 'cat_id',
        // 指定各选项所依据的显示文本
        label: 'cat_name',
        // 指定各选项的子项所依据的标识值
        children: 'children',
        // 子选项的展开方式
        expandTrigger: 'hover',
        // 使父子选项不关联，可以使一级分类能被选中
        checkStrictly: true
      },
      // 标签页中被激活面板的名称，默认激活动态参数的面板
      activeName: 'many',
      /* 以下是参数数据列表 依照面板区分 */
      // 动态参数数据列表
      manyTableList: [],
      // 静态属性数据列表
      onlyTableList: [],
      // 控制 添加参数对话框的显示
      addParamsDialogVisible: false,
      // 添加参数表单的数据绑定对象
      addParamsForm: {
        attr_name: ''
      },
      // 添加参数表单的规则验证对象
      addParamsFormRules: {
        attr_name: [
          { required: true, message: '不能为空！', trigger: 'blur' }
        ]
      },
      // 控制 修改参数对话框的显示
      editParamsDialogVisible: false,
      // 修改参数表单的数据绑定对象
      editParamsForm: {},
      // 修改参数表单的规则验证对象
      editParamsFormRules: {
        attr_name: [
          { required: true, message: '不能为空！', trigger: 'blur' }
        ]
      }
      // // // 💥不能在这里写！！！会发生所有展开行的输入框错误关联
      // // 控制 新增标签按钮与输入文本框的切换
      // inputVisible: false,
      // // 记录 新增标签的文本值
      // inputValue: ''
    }
  },
  created () {
    this.getCategories()
  },
  methods: {
    // 获取所有商品分类数据列表
    async getCategories () {
      const {data: res} = await getCategoriesByTypeRequest(3)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      // 请求成功
      this.categoriesList = res.data
    },
    // 监听 级联选择器中已选分类变化 的回调
    selectedCateChange () {
      // console.log(this.selectedKeys)
      // 级联选择器的选中项发生变化，获取参数数据列表
      this.getParams()
    },
    // 监听 标签页中面板激活变化 的回调
    handleTabClick () {
      // console.log(this.activeName)
      // 面板发生变化，获取参数数据列表
      this.getParams()
    },
    // 获取参数数据列表
    async getParams () {
      // 判断是否选中的是三级分类
      if (this.selectedKeys.length !== 3) {
        // 选中的是一或二级分类， 清空已选分类id组成的数组
        this.selectedKeys = []
        // 清空面板的参数数据列表，避免选中三级分类后再选回一、二级，残留上次三级分类的参数数据列表
        this.manyTableList = []
        this.onlyTableList = []
        return
      }
      // 选中的是三级分类下
      // 发送axios请求 根据指定的三级分类id和标签页中被激活面板的名称，获取对应的参数数据列表
      const {data: res} = await getParamsListRequest(this.threeLevelCateId, this.activeName)
      // console.log(res)

      // ⭐注意：这里先对响应数据中每一条参数数据的attr_vals做处理，将字符串分割成为字符串数组重新赋值
      res.data.forEach(item => {
        // 若是新增的参数，这一项是空，如果直接执行分割，会生成一个空字符串的数组( 即"".split(' ') => [''] )
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 避免所有展开行的输入框错误关联，需要为(每条参数数据)每个展开行各自输入框 添加控制属性、记录文本值
        item.inputVisible = false
        item.inputValue = ''
      })
      // console.log(res.data)

      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
      // 请求成功
      // 判断 是动态参数面板的参数数据列表，还是静态属性面板的参数数据列表
      if (this.activeName === 'many') {
        // 动态参数数据列表
        this.manyTableList = res.data
      } else {
        // 静态属性数据列表
        this.onlyTableList = res.data
      }
    },
    // 监听 添加参数对话框关闭时 的回调
    addParamsDialogClosed () {
      // 重置表单
      this.$refs['addParamsFormRef'].resetFields()
    },
    // 添加参数对话框确认按钮的回调
    async addParams () {
      // 发送axios请求  根据指定的三级分类id、激活面板名称、相关参数数据，添加动态参数或静态属性
      const {data: res} = await addParamsRequest(this.threeLevelCateId, this.activeName, this.addParamsForm)
      if (res.meta.status !== 201) return this.$message.error('添加参数数据失败！')
      // 请求成功
      this.$message.success('添加参数数据成功！')
      // 关闭添加参数对话框
      this.addParamsDialogVisible = false
      // 重新获取参数数据列表 页面刷新渲染
      this.getParams()
    },
    // 修改按钮的回调 展示修改参数对话框
    async showEditParamsDialog (paramsId) {
      // 发送axios请求  根据指定三级分类id和激活面板名称、指定参数/属性id，查询当前参数数据
      const {data: res} = await getParamsRequest(this.threeLevelCateId, this.activeName, paramsId)
      if (res.meta.status !== 200) return this.$message.error('获取参数数据失败！')
      // 请求成功
      // 存入 修改参数表单的数据绑定对象
      this.editParamsForm = res.data
      // 展示修改参数对话框
      this.editParamsDialogVisible = true
    },
    // 修改参数对话框确定按钮的回调
    editParams () {
      // 进行表单统一验证
      this.$refs['editParamsFormRef'].validate(async valid => {
        if (!valid) return
        // 校验通过
        // 发送axios请求 修改参数数据
        const {data: res} = await editParamsRequest(this.threeLevelCateId, this.editParamsForm)
        if (res.meta.status !== 200) return this.$message.error(`修改${this.titleText}数据失败！`)
        // 请求成功
        this.$message.success(`修改${this.titleText}数据成功！`)
        // 关闭修改参数对话框
        this.editParamsDialogVisible = false
        // 重新获取参数数据列表 页面刷新渲染
        this.getParams()
      })
    },
    // 监听 修改参数对话框关闭时的回调
    editParamsDialogClosed () {
      // 重置表单
      this.$refs['editParamsFormRef'].resetFields()
    },
    // 删除按钮的回调
    deleteParams (paramsId) {
      // 弹出提示弹框
      this.$confirm('确定永久删除该参数吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        // 发送axios请求 根据指定三级分类id和参数/属性id，删除参数数据
        const {data: res} = await deleteParamsRequest(this.threeLevelCateId, paramsId)
        if (res.meta.status !== 200) return this.$message.error(`删除${this.titleText}数据失败！`)
        // 请求成功
        this.$message.success(`删除${this.titleText}数据成功！`)
        // 重新获取参数数据列表 页面刷新渲染
        this.getParams()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 新增标签按钮的回调
    showInput (row) {
      // this.inputVisible = true // 错误

      // 应该改成 显示当前展开行的输入文本框；隐藏当前展开行的新增标签按钮
      row.inputVisible = true
      // ⭐💥this.$nextTick()/Vue.nextTick() 是 Vue 的一个延迟钩子函数，接受一个回调参数
      // 只有在DOM更新渲染后才会执行里面的回调
      this.$nextTick(() => {
        // 这里第一个$refs获取被标识的Vue组件；第二个$refs获取构成Vue组件的原生DOM对象
        this.$refs.saveTagInputRef.$refs.input.focus()
      })
    },
    // 监听 输入文本框键盘按下回车抬起、失焦事件 的回调
    async handleInputConfirm (row) {
      // console.log(`新增标签值为${this.inputValue}`) // 错误
      // this.inputVisible = false // 错误

      // 应该改成 隐藏当前展开行的输入文本框；显示当前展开行的新增标签按钮
      row.inputVisible = false

      // console.log(`${row.inputValue}`)
      if (row.inputValue.trim().length === 0) {
        // 用户没有输入 或 只输入了连续空格
        // 初始化记录文本值，显示新增标签按钮
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 用户有输入合法数据
      // 向字符串数组attr_vals中压入记录文本值（因为遍历字符串数组才生成的标签）
      row.attr_vals.push(row.inputValue)
      // 初始化记录文本值，显示新增标签按钮
      row.inputValue = ''
      row.inputVisible = false
      /* 💥注意：到这只进行了前端渲染，并没有与后端交互————必须向后端发送请求，更新存储新数据，否则页面刷新数据就没有了！！！ */
      // 将字符串数组attr_vals拼接回字符串
      // 发送axios请求 根据指定三级分类id、激活面板名称、参数/属性id、参数名称、参数项(包含新增标签的值) 更新对应参数数据
      const {data: res} = await updateParamsRequest(this.threeLevelCateId, this.activeName, row.attr_id, row.attr_name, row.attr_vals.join(' '))
      if (res.meta.status !== 200) return this.$message.error('更新参数项失败！')
      this.$message.success('更新参数项成功！')
    },
    // 监听 标签被删除关闭时 的回调
    async handleTagClose (index, row) {
      // 根据index索引值，在字符串数组attr_vals中找到对应的参数项，并把它删除
      row.attr_vals.splice(index, 1)
      // 将字符串数组attr_vals拼接回字符串
      // 发送axios请求 根据指定三级分类id、激活面板名称、参数/属性id、参数名称、参数项(包含新增标签的值) 更新对应参数数据
      const {data: res} = await updateParamsRequest(this.threeLevelCateId, this.activeName, row.attr_id, row.attr_name, row.attr_vals.join(' '))
      if (res.meta.status !== 200) return this.$message.error('更新参数项失败！')
      this.$message.success('更新参数项成功！')
    }
  },
  computed: {
    // 通过计算判断 级联选择器已选分类id组成的数组长度(数组长度对应分类的层级) 从而决定是否禁用按钮
    isBtnDisabled () {
      if (this.selectedKeys.length !== 3) {
        // 选中的是一、二级分类，禁用按钮
        return true
      }
      // 选中了三级分类，不禁用按钮
      return false
    },
    // 通过计算判断 级联选择器已选分类id组成的数组长度(数组长度对应分类的层级) 只有选中了三级分类才能返回三级分类的id
    'threeLevelCateId': {
      get () {
        if (this.selectedKeys.length === 3) {
          // 选中了三级分类，返回三级分类的id
          return this.selectedKeys[this.selectedKeys.length - 1]
        }
        // 选中的是一、二级分类，返回null
        return null
      }
    },
    // 通过计算判断 被激活面板的名称 从而决定对话框的标题文本
    'titleText': {
      get () {
        if (this.activeName === 'many') {
          // 动态参数
          return '动态参数'
        }
        // 静态属性
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .cate_option_row {
    margin: 15px 0;
  }
  .el-tag {
    margin: 10px;
  }
  .input-new-tag {
    width: 100px;
    margin: 10px;
  }
</style>
