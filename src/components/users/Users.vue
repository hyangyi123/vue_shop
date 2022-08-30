<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加用户区域 -->
      <el-row :gutter="30">
        <el-col :span="8">
          <el-input v-model="queryObj.query" @change="getUsers" clearable @clear="getUsers" placeholder="请输入搜索关键字...">
            <el-button slot="append" icon="el-icon-search" @click="getUsers"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="addUserDialogVisible = true" type="primary">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表显示区域 -->
      <el-row>
        <!-- 注意：data为el-table的数据源 -->
        <el-table :data="usersList" style="width: 100%" border stripe>
          <!-- 索引表格列 -->
          <el-table-column type="index"></el-table-column>
          <!-- 自定义表格列 prop对应数据键名 label为表格列名-->
          <el-table-column prop="username" label="用户名"></el-table-column>
          <el-table-column prop="email" label="邮箱"></el-table-column>
          <el-table-column prop="mobile" label="电话"></el-table-column>
          <el-table-column prop="role_name" label="角色"></el-table-column>
          <el-table-column label="状态" width="80px">
            <!-- 作用域插槽 将插槽prop解构得到row，row为当前行所对应的用户数据 -->
            <template v-slot="{ row }">
              <!-- {{ row }} -->
              <!-- 这里双向数据绑定的mg_state与上面的prop重叠了，会覆盖掉，直接删除上面prop="mg_state" -->
              <el-switch v-model="row.mg_state" @change="userStateChange(row)"></el-switch>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <!-- 通过作用域插槽的形式 自定义操作列的渲染 -->
            <template v-slot="{ row }">
              <el-button @click="showEditDialog(row.id)" type="primary" icon="el-icon-edit" size="mini" circle></el-button>
              <el-button @click="deleteUser(row.id)" type="danger" icon="el-icon-delete" size="mini" circle></el-button>
              <el-tooltip :enterable="false" effect="dark" content="分配角色" placement="top">
                <el-button @click="showSetRoleDialog(row)" type="warning" icon="el-icon-setting" size="mini" circle></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </el-row>
      <!-- 分页器显示区域 -->
      <el-row>
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryObj.pagenum"
        :page-sizes="[1, 2, 4, 6, 10]"
        :page-size="queryObj.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        >
        </el-pagination>
      </el-row>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialogVisible" @close="addUserDialogClose" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户对话框-->
     <el-dialog title="修改用户" @close="editUserDialogClose" :visible.sync="editUserDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editUserDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog @close="setRoleDialogClose" title="分配角色" :visible.sync="setRoleDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <div>
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.role_name}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
            v-for="role in rolesList"
            :key="role.id"
            :label="role.roleName"
            :value="role.id"
            >
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="setRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
// 引入相应的api请求
import { getUsersListRequest, updateUserStateRequest, addUserRequest,
  getUserRequest, editUserRequest, deleteUserRequest, getRolesListRequest,
  allotRoleByIdRequest } from '../../api'
export default {
  data () {
    // 自定义验证规则  校验密码
    const checkPassword = (rule, value, callback) => {
      // 配置正则表达式
      const patrn = /^[A-z0-9_]+$/
      if (value.length < 6 || value.length > 15) {
        // 长度非法
        return callback(new Error('密码的长度在 6~15 个字符之间'))
      } else if (!patrn.test(value)) {
        // 非法密码
        callback(new Error('可以是字母、数字、下划线组成，不能含有其它非法符号'))
      } else {
        // 合法密码
        callback()
      }
    }
    // 自定义验证规则  校验邮箱
    const checkEmail = (rule, value, callback) => {
      // 配置正则表达式
      const patrn = /^\w+@\w+(\.\w+)+$/
      if (patrn.test(value)) {
        // 合法的邮箱
        return callback()
      }
      // 非法邮箱
      callback(new Error('请输入合法的邮箱'))
    }
    // 自定义验证规则  校验手机号码
    const checkMobile = (rule, value, callback) => {
      // 配置正则表达式
      const patrn = /^1[34578]\d{9}$/
      if (patrn.test(value)) {
        // 合法的手机号
        return callback()
      }
      // 非法手机号
      callback(new Error('请输入合法的手机号，由11位数字组成'))
    }
    return {
      // 获取用户数据列表的参数对象
      queryObj: {
        // 记录 查询的关键字
        query: '',
        // 记录 当前页码数
        pagenum: 1,
        // 记录 每页大小（即 每页显示多少条用户数据）
        pagesize: 2
      },
      // 记录 用户数据总条数（即 总共有多少条用户数据）
      total: 0,
      // 用户数据列表
      usersList: [],
      // 控制 添加用户对话框的显示
      addUserDialogVisible: false,
      // 添加用户表单的数据绑定对象
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的规则验证对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名的长度在 3~10 个字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          // 采用自定义验证规则
          { validator: checkPassword, trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 采用自定义验证规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          // 采用自定义验证规则
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制 修改用户对话框的显示
      editUserDialogVisible: false,
      // 修改用户表单的数据绑定对象
      editForm: {},
      // 修改用户表单的规则验证对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          // 采用自定义验证规则
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          // 采用自定义验证规则
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制 分配角色对话框的显示
      setRoleDialogVisible: false,
      // 记录当前要分配角色的用户数据
      userInfo: '',
      // 所有角色数据列表(注意：每个角色里面包含了对应权限)
      rolesList: [],
      // 记录 分配角色对话框中下拉列表选中的角色id值
      selectedRoleId: ''
    }
  },
  created () {
    this.getUsers()
  },
  methods: {
    // 获取用户数据列表
    async getUsers () {
      const { data: res } = await getUsersListRequest(this.queryObj)
      // console.log(res)
      // 请求失败
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户数据列表失败！')
      }
      // 请求成功
      this.total = res.data.total
      this.usersList = res.data.users
    },
    // 分页区域 监听 每页大小pagesize变化的回调 （即 修改每页显示多少条用户数据）
    handleSizeChange (newSize) {
      this.queryObj.pagesize = newSize
      this.getUsers()
    },
    // 分页区域 监听 页码数pagenum变化的回调（即 跳转到第几页）
    handleCurrentChange (newNum) {
      this.queryObj.pagenum = newNum
      this.getUsers()
    },
    // el-switch 状态发生变化的回调
    async userStateChange (userInfo) {
      // console.log(userInfo)
      // 发送axios请求 修改更新用户数据的状态
      const {data: res} = await updateUserStateRequest(userInfo)
      // 修改更新状态失败
      if (res.meta.status !== 200) {
        // 及时修改回原状态，使页面开关可以重新渲染回到原来状态
        userInfo.mg_state = !userInfo.mg_state
        return this.$message.error('修改用户状态失败！')
      }
      this.$message.success('修改用户状态成功！')
    },
    // 监听 添加用户对话框 关闭时的回调
    addUserDialogClose () {
      // 重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户对话框 确定按钮的回调
    addUser () {
      // 进行表单统一验证
      this.$refs.addFormRef.validate(async valid => {
        // 验证不通过
        if (!valid) return false
        // 验证通过
        // 发送axios请求 添加用户
        const {data: res} = await addUserRequest(this.addForm)
        // 请求失败
        if (res.meta.status !== 201) return this.$message.error('添加用户失败！')
        // 请求成功
        // 关闭添加用户对话框
        this.addUserDialogVisible = false
        this.$message.success('添加用户成功！')
        // 重新获取用户数据列表 刷新渲染
        this.getUsers()
      })
    },
    // 表格项中修改按钮的回调 展示修改用户对话框
    async showEditDialog (id) {
      // 发送axios请求 通过指定id获取用户数据
      const {data: res} = await getUserRequest(id)
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error('获取用户数据失败！')
      // 请求成功
      // 存入修改用户表单的数据绑定对象
      this.editForm = res.data
      // 显示修改用户对话框
      this.editUserDialogVisible = true
    },
    // 监听 修改用户对话框 关闭时的回调
    editUserDialogClose () {
      // 重置表单
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户对话框 确定按钮的回调
    editUser () {
      // 进行表单统一验证
      this.$refs.editFormRef.validate(async valid => {
        // 校验不通过
        if (!valid) return
        // 校验通过
        // 发送axios请求 根据指定id和相关参数修改用户数据
        const {data: res} = await editUserRequest(this.editForm)
        if (res.meta.status !== 200) return this.$message.error('修改用户失败！')
        // 请求成功
        // 关闭修改用户对话框
        this.editUserDialogVisible = false
        this.$message.success('修改用户成功！')
        // 重新获取用户数据列表 刷新渲染
        this.getUsers()
      })
    },
    // 表格项中删除按钮的回调
    deleteUser (id) {
      // 弹出提示弹框
      this.$confirm('确定永久删除该用户吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        // 发送axios请求 根据指定id删除用户数据
        const {data: res} = await deleteUserRequest(id)
        // 请求失败
        if (res.meta.status !== 200) return this.$message.error('删除用户失败')
        // 请求成功
        this.$message.success('删除用户成功！')
        // 重新获取用户数据列表 刷新渲染
        this.getUsers()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 分配角色按钮的回调 展示分配角色对话框
    async showSetRoleDialog (userInfo) {
      // 记录当前要分配角色的用户数据
      this.userInfo = userInfo
      // 发送axios请求 获取所有角色数据列表
      const {data: res} = await getRolesListRequest()
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      // 请求成功
      this.rolesList = res.data
      console.log(this.rolesList)
      // 显示分配角色对话框
      this.setRoleDialogVisible = true
    },
    // 分配角色对话框 确定按钮的回调
    async setRole () {
      // 未选择要分配的新角色
      if (!this.selectedRoleId) return this.$message.error('请选择要分配的新角色！')
      // 已选
      // 发送axios请求  对指定id用户分配某个角色
      const {data: res} = await allotRoleByIdRequest(this.userInfo.id, this.selectedRoleId)
      if (res.meta.status !== 200) return this.$message.error('分配角色失败！')
      // 请求成功
      this.$message.success('分配角色成功！')
      // 关闭分配角色对话框
      this.setRoleDialogVisible = false
      // 更新用户列表 页面刷新渲染
      this.getUsers()
    },
    // 监听 分配角色对话框 关闭的回调
    setRoleDialogClose () {
      // 重置下拉列表的选中值
      this.selectedRoleId = ''
      // 初始化用户数据
      this.userInfo = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>
