<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 显示角色数据的表格 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开行操作 -->
        <el-table-column type="expand">
          <template v-slot="{ row }">
            <!-- <pre>{{ row }}</pre> -->
            <!-- 一级权限 -->
            <el-row v-for="(item1, i1) in row.children" :key="item1.id" :class="['borderBottom', i1 === 0 ? 'borderTop': '', 'center']">
              <el-col :span="8">
                <el-tag @close="deleteRight(row, item1.id)" closable>{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="14">
                <!-- 二级权限 -->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'borderTop', 'center']">
                  <el-col :span="6">
                    <el-tag @close="deleteRight(row, item2.id)" type="success" closable>{{item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                      <!-- 三级权限 -->
                      <el-tag @close="deleteRight(row, item3.id)" v-for="item3 in item2.children" :key="item3.id" type="warning" closable>{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300">
          <template v-slot="{ row }">
            <el-button @click="showEditRoleDialog(row.id)" type="primary" icon="el-icon-edit" round size="mini">编辑</el-button>
            <el-button @click="deleteRole(row.id)" type="danger" icon="el-icon-delete" round size="mini">删除</el-button>
            <el-button @click="showSetRightDialog(row)" type="warning" icon="el-icon-setting" round size="mini">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限对话框 -->
    <el-dialog @close="setRightDialogClose" title="分配权限" :visible.sync="setRightDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <!-- 树形分支控件 -->
      <el-tree
      ref="treeRef"
      :data="rightsList"
      :props="treeProps"
      default-expand-all
      show-checkbox
      node-key="id"
      :default-checked-keys="defCheckedKeys"
      >
      </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRight">确 定</el-button>
      </span>
    </el-dialog>

     <!-- 添加角色对话框 -->
    <el-dialog @close="addRoleDialogClose" title="添加角色" :visible.sync="addRoleDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="addRoleForm" :rules="addRoleFormRules" ref="addRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog @close="editRoleDialogClose" title="修改角色" :visible.sync="editRoleDialogVisible" width="50%">
      <!-- 内容主体区域 -->
      <el-form :model="editRoleForm" :rules="editRoleFormRules" ref="editRoleFormRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">
// 引入对应的请求api
import { getRolesListRequest, deleteRightByIdRequest, getRightsListRequest,
  allotRightsByIdRequest, addRoleRequest, getRoleRequest, editRoleRequest,
  deleteRoleRequest } from '../../api'
export default {
  data () {
    return {
      // 所有角色数据列表(注意：每个角色里面包含了对应权限)
      rolesList: [],
      // 控制 分配权限对话框的显示
      setRightDialogVisible: false,
      // 所有权限数据列表(一、二、三级)
      rightsList: [],
      // 树形控件的属性识别绑定对象
      treeProps: {
        // label是分支名称识别
        label: 'authName',
        // children是子分支识别
        children: 'children'
      },
      // 存有默认选中三级节点id的数组
      defCheckedKeys: [],
      // 记录当前角色id，方便对指定id角色分配若干权限
      roleId: '',
      // 控制 添加角色对话框的显示
      addRoleDialogVisible: false,
      // 添加角色表单的数据绑定对象
      addRoleForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色表单的规则验证对象
      addRoleFormRules: {
        roleName: [
          { required: true, message: '必须输入角色名称', trigger: 'blur' }
        ]
      },
      // 控制 修改角色对话框的显示
      editRoleDialogVisible: false,
      // 修改角色表单的数据绑定对象
      editRoleForm: {},
      // 修改角色表单的规则验证对象
      editRoleFormRules: {
        roleName: [
          { required: true, message: '必须输入角色名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getRoles()
  },
  methods: {
    // 获取所有角色数据列表
    async getRoles () {
      const {data: res} = await getRolesListRequest()
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      // 请求成功
      this.rolesList = res.data
      console.log(this.rolesList)
    },
    // 点击标签的‘X’ 删除指定id角色的指定id权限
    async deleteRight (role, rightId) {
      // 弹出提示弹框
      this.$confirm('确定永久删除该权限吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        // 发送axios请求 删除指定角色的指定id权限
        const {data: res} = await deleteRightByIdRequest(role.id, rightId)
        // 请求失败
        if (res.meta.status !== 200) return this.$message.error('删除角色权限失败！')
        // 请求成功
        // 注意：返回的响应数据中的data，是当前角色下的最新权限数据列表
        // 为避免 重新渲染时展开行关闭，直接将当前角色的权限数据列表更新即可
        // this.getRoles()
        role.children = res.data
        this.$message.success('删除角色权限成功！')
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    },
    // 分配权限按钮的回调 展示分配权限对话框
    async showSetRightDialog (role) {
      // 记录当前角色id
      this.roleId = role.id
      // 发送axios请求 获取权限数据列表(树状形式返回)
      const {data: res} = await getRightsListRequest('tree')
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败！')
      // 请求成功
      this.rightsList = res.data
      // 递归获取默认选中三级节点id
      this.getLeafKeys(role, this.defCheckedKeys)
      // 显示分配权限对话框
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取默认选中三级节点id，并存入 defCheckedKeys 数组中
    getLeafKeys (node, array) {
      // 当前为叶子/三级节点，将叶子节点id压入数组
      if (!node.children) return array.push(node.id)
      // 不是叶子节点，遍历并递归调用继续寻找
      node.children.map(item => this.getLeafKeys(item, array))
    },
    // 监听 分配权限对话框 关闭时的回调
    setRightDialogClose () {
      // 初始化 默认选中三级节点id的数组（避免下次打开时，上一个角色所记录的权限叠加到当前角色权限中）
      this.defCheckedKeys = []
    },
    // 分配权限对话框 确定按钮的回调
    async allotRight () {
      // 所有选中与半选中节点的id数组
      const keys = [
        // 获取半选中节点的id
        ...this.$refs.treeRef.getHalfCheckedKeys(),
        // 获取全选中节点的id
        ...this.$refs.treeRef.getCheckedKeys()
      ]
      // 对每个数组元素添加‘,’分隔  并拼接成字符串
      const keysStr = keys.join(',')
      // console.log(keysStr)  // 字符串：'a, b, c, d'

      // 发送axios请求 对指定id角色分配权限
      const {data: res} = await allotRightsByIdRequest(this.roleId, keysStr)
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      // 请求成功
      this.$message.success('分配权限成功！')
      // 关闭分配权限对话框
      this.setRightDialogVisible = false
      // 重新获取所有角色数据列表 刷新页面
      this.getRoles()
    },
    // 添加角色对话框 确定按钮的回调
    addRole () {
      // 进行表单统一验证
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过 发送axios请求添加角色
        const {data: res} = await addRoleRequest(this.addRoleForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败！')
        // 请求成功
        // 关闭添加角色对话框
        this.addRoleDialogVisible = false
        // 更新角色数据列表 页面刷新渲染
        this.getRoles()
      })
    },
    // 监听 添加角色对话框关闭时的回调
    addRoleDialogClose () {
      // 重置表单
      this.$refs.addRoleFormRef.resetFields()
    },
    // 修改编辑按钮的回调 展示修改角色对话框
    async showEditRoleDialog (roleId) {
      // 发送axios请求  根据指定id获取角色数据
      const {data: res} = await getRoleRequest(roleId)
      if (res.meta.status !== 200) return this.$message.error('获取角色数据失败！')
      // 请求成功
      // 存入修改角色表单的数据绑定对象(方便对话框的数据显示，以及后续修改角色)
      this.editRoleForm = res.data
      // 显示修改角色对话框
      this.editRoleDialogVisible = true
    },
    // 监听 修改角色对话框关闭时的回调
    editRoleDialogClose () {
      // 重置表单
      this.$refs.editRoleFormRef.resetFields()
    },
    // 修改角色对话框 确定按钮的回调
    editRole () {
      // 进行提交修改发送请求前的表单统一验证
      this.$refs.editRoleFormRef.validate(async valid => {
        // 验证不通过
        if (!valid) return
        // 验证通过
        // 发送axios请求 根据指定id和相关参数修改角色数据
        const {data: res} = await editRoleRequest(this.editRoleForm)
        if (res.meta.status !== 200) return this.$message.error('修改角色失败！')
        // // 请求成功
        // // 关闭修改角色对话框
        this.editRoleDialogVisible = false
        this.$message.success('修改角色成功！')
        // 重新获取角色数据列表 页面重新渲染
        this.getRoles()
      })
    },
    // 删除角色按钮的回调
    deleteRole (roleId) {
      // 弹出提示弹框
      this.$confirm('确定永久删除该角色吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(async () => {
        // 发送axios请求 根据指定id删除对应角色数据
        const {data: res} = await deleteRoleRequest(roleId)
        if (res.meta.status !== 200) return this.$message.error('删除角色失败！')
        // 请求成功
        this.$message.success('删除角色成功！')
        // 重新获取角色数据列表 页面刷新渲染
        this.getRoles()
      }).catch(() => {
        this.$message.info('已取消删除')
      })
    }
  }

}
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .borderTop {
    border-top: 1px solid #7d2be8;
  }
  .borderBottom {
    border-bottom: 1px solid #7d2be8;
  }
  .center {
    display: flex;
    align-items: center;
  }
</style>
