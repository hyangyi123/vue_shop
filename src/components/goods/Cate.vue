<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button @click="showAddCateDialog" type="primary">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 商品分类列表显示区域 -->
      <el-row>
        <!-- 使用树形网格 -->
        <tree-table
        class="treeTable"
        :data="categoriesList"
        :columns="columns"
        :show-row-hover="false"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        border
        >
          <!-- 自定义模板列 -->
          <!-- 向插槽提供内容时，可以在template元素上使用v-slot指令，使得template中的所有内容 传入相应的插槽名 -->
          <!-- 是否有效 -->
          <template v-slot:isOk="{ row }">
            <i class="el-icon-success" v-if="row.cat_deleted === false" style="color: green;"></i>
            <i class="el-icon-error" v-else style="color: red;"></i>
          </template>
          <!-- 排序 -->
          <template v-slot:order="{ row }">
            <el-tag v-if="row.cat_level === 0" size="mini">一级</el-tag>
            <el-tag v-else-if="row.cat_level === 1" type="success" size="mini">二级</el-tag>
            <el-tag v-else type="warning" size="mini">三级</el-tag>
          </template>
          <!-- 操作 -->
          <template v-slot:option="{ row }">
            <el-button @click="showEditCateDialog(row.cat_id)" type="primary" icon="el-icon-edit" size="mini">修改</el-button>
            <el-button @click="deleteCate(row.cat_id)" type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </template>
        </tree-table>
      </el-row>
      <!-- 分页器区域 -->
      <el-row>
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryObj.pagenum"
        :page-size="queryObj.pagesize"
        :page-sizes="[2, 4, 5, 6, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        >
        </el-pagination>
      </el-row>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog @close="addCateDialogClosed" title="添加分类" :visible.sync="addCateDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- 级联选择器 -->
          <!-- 注意：v-model绑定的selectedKeys数组记录级联选择器已选分类id；options为数据源；props为配置对象，负责配置每项显示或选中的依据-->
          <el-cascader
          v-model="selectedKeys"
          :options="parentCategoriesList"
          :props="cascaderProps"
          @change="selectedCateChange"
          clearable
          >
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <el-dialog @click="editCateDialogClosed" title="修改分类" :visible.sync="editCateDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <!-- 修改分类的表单 -->
      <el-form :model="editCateForm" :rules="editCateFormRules" ref="editCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
// 引入对应的api请求
import { getCategoriesRequest, getCategoriesByTypeRequest, addCateRequest,
  getCateRequest, editCateRequest, deleteCateRequest } from '../../api'
export default {
  data () {
    return {
      // 商品分类数据列表
      categoriesList: [],
      // 存有请求参数的查询对象
      queryObj: {
        // 值 1，2，3   3表示所有分类；2表示一级、二级分类；1表示三级分类
        type: 3,
        // 记录要请求的页码数，默认为第一页
        pagenum: 1,
        // 记录要请求的每页大小(即 每页要显示多少条分类数据)，默认为每页五条
        pagesize: 5
      },
      // 记录 分类数据总条数(即 总共有多少条分类数据)
      total: 0,
      // 树形网格各列的配置数组
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          prop: 'cat_deleted',
          // 将当前列定义为 自定义模版列
          type: 'template',
          // 当前列使用的模版名称
          template: 'isOk'
        },
        {
          label: '排序',
          prop: 'cat_level',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'option'
        }
      ],
      // 控制 添加分类对话框的显示
      addCateDialogVisible: false,
      // 添加分类表单的数据绑定对象
      addCateForm: {
        // 当前分类的名称
        cat_name: '',
        // 当前分类的父id，默认为0(一级分类的父id为0，即没有选中父级分类时，为一级分类)
        cat_pid: 0,
        // 当前分类的层级，默认为0，一级分类
        cat_level: 0
      },
      // 添加分类表单的规则验证对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 记录 父级分类数据列表
      parentCategoriesList: [],
      // 记录 级联选择器 已选分类id组成的数组
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
      // 控制 修改分类对话框的显示
      editCateDialogVisible: false,
      // 修改分类表单的数据绑定对象
      editCateForm: {},
      // 修改分类表单的规则验证对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '必须输入修改后的分类名', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCategories()
  },
  methods: {
    // 获取商品分类数据列表
    async getCategories () {
      const {data: res} = await getCategoriesRequest(this.queryObj)
      console.log(res.data)
      if (res.meta.status !== 200) return this.$message.error('获取商品分类列表失败！')
      // 请求成功
      this.categoriesList = res.data.result
      // 记录 分类数据总条数
      this.total = res.data.total
    },
    // 监听 每页显示数据条数(pagesize)变化 的回调
    handleSizeChange (newSize) {
      this.queryObj.pagesize = newSize
      // 重新获取商品分类数据列表 页面刷新渲染
      this.getCategories()
    },
    // 监听 页码数(pagenum)变化 的回调
    handleCurrentChange (newPage) {
      this.queryObj.pagenum = newPage
      // 重新获取商品分类数据列表 页面刷新渲染
      this.getCategories()
    },
    // 添加分类按钮的回调
    showAddCateDialog () {
      // 获取父级分类数据列表(一、二级分类)
      this.getParentCategories()
      // 显示添加分类对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据列表(一二级)
    async getParentCategories () {
      const {data: res} = await getCategoriesByTypeRequest(2)
      if (res.meta.status !== 200) return this.$message.error('获取父级分类数据失败！')
      // 请求成功
      // 更新父级分类数据列表
      this.parentCategoriesList = res.data
    },
    // 监听 级联选择器中已选分类变化 的回调
    selectedCateChange (selected) {
      // // 直接从级联选择器双向绑定的数组获取已选分类id 或者 从当前回调的参数获取已选分类id
      // // 这两种方法都可以获取已选分类id
      // console.log(selected)
      console.log(this.selectedKeys)

      // 注意：selectedKeys数组长度为0，证明未选中任何分类，为一级分类，cat_pid与cat_level都为0
      // 若数组长度不为0，证明用户有选中分类，依靠数组长度确认分类的层级，长度为1证明是二级分类，cat_level为1；长度为2证明是三级分类，cat_level为2
      if (this.selectedKeys.length !== 0) {
        // 用户有选中分类
        // 更新当前分类的父级分类id  取最后一个数组元素作为直接关联的父级分类id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 更新当前分类的层级 数组长度刚刚好与层级对应
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        // 用户没有选中分类 或 选中后取消了选中
        // 重置 当前分类的父级分类id为初始值0
        this.addCateForm.cat_pid = 0
        // 重置 当前分类的层级为初始值0
        this.addCateForm.cat_level = 0
      }
    },
    // 添加分类对话框 确定按钮的回调
    addCate () {
      // console.log(this.addCateForm)
      // 进行表单统一验证
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过
        // 发送axios请求 进行添加分类
        const {data: res} = await addCateRequest(this.addCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
        // 请求成功
        this.$message.success('添加分类成功！')
        // 关闭添加分类对话框
        this.addCateDialogVisible = false
        // 重新获取所有分类数据列表 页面刷新渲染
        this.getCategories()
      })
    },
    // 监听 添加分类对话框关闭时 的回调
    addCateDialogClosed () {
      // 重置表单
      this.$refs.addCateFormRef.resetFields()
      // 重置已选中项id组成的数组  注意：！这里重置数组后，监听数组变化的回调并不会执行
      this.selectedKeys = []
      // 所以必须对 addCateForm中的分类层级、父分类id 进行默认初始化设置
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 修改分类按钮的回调 显示修改分类对话框
    async showEditCateDialog (cateId) {
      // 发送axios请求 根据指定id获取分类数据
      const {data: res} = await getCateRequest(cateId)
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败！')
      // 请求成功
      // 存入修改分类表单的数据绑定对象
      this.editCateForm = res.data
      // 显示修改分类对话框
      this.editCateDialogVisible = true
    },
    // 监听 修改分类对话框关闭时 的回调
    editCateDialogClosed () {
      // 重置表单
      this.$refs.editCateFormRef.resetFields()
      // 初始化修改分类表单的数据绑定对象(有些许多余)
      this.editCateForm = {}
    },
    // 修改分类对话框 确定按钮的回调
    editCate () {
      // 进行表单统一验证
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过
        // 发送axios请求 根据指定id和相关参数修改分类
        const {data: res} = await editCateRequest(this.editCateForm)
        if (res.meta.status !== 200) return this.$message.error('修改分类数据失败！')
        // 请求成功
        this.$message.success('修改分类数据成功！')
        // 关闭修改分类对话框
        this.editCateDialogVisible = false
        // 重新获取所有分类数据列表 页面刷新渲染
        this.getCategories()
      })
    },
    // 删除分类按钮的回调
    deleteCate (cateId) {
      // 弹出提示弹框
      this.$confirm('确定永久删除该分类吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        // 发送axios请求 根据指定id删除分类数据
        const {data: res} = await deleteCateRequest(cateId)
        if (res.meta.status !== 200) return this.$message.error('删除分类失败')
        // 请求成功
        this.$message.success('删除分类成功！')
        // 重新获取所有分类数据列表 页面刷新渲染
        this.getCategories()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }
}
</script>

<style scoped>
  .treeTable {
    margin-top: 15px;
  }
</style>
