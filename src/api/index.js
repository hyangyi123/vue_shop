// 封装axios请求api

// 引入axios配置文件
import axios from './axios_config'

// 登录                                       'login'为请求路径
export const loginRequest = loginForm => axios.post('login', loginForm)
// 左侧菜单列表
export const getMenuListRequest = () => axios.get('menus')
// 用户数据列表
export const getUsersListRequest = queryObj => axios.get('users',
  { // 💥注意：axios的get请求体携带参数，必须传入一个params属性对象
    params: {
      ...queryObj
    }
  }
)
// 修改更新用户数据的状态
export const updateUserStateRequest = userInfo => axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
// 添加用户
export const addUserRequest = addUserForm => axios.post('users', addUserForm)
// 根据指定id查询用户
export const getUserRequest = userId => axios.get(`users/${userId}`)
// 根据指定id和相关参数修改用户
export const editUserRequest = editUserForm => axios.put(`users/${editUserForm.id}`,
  {
    email: editUserForm.email,
    mobile: editUserForm.mobile
  }
)
// 根据指定id删除用户
export const deleteUserRequest = userId => axios.delete(`users/${userId}`)
// 对指定id用户分配某个角色
export const allotRoleByIdRequest = (userId, roleId) => axios.put(`users/${userId}/role`,
  {
    rid: roleId
  }
)
// ------------------------------------------------------------------------------
// 所有权限数据列表(一、二、三级)       type是指定以哪种类型响应（list列表、tree树状）
export const getRightsListRequest = type => axios.get(`rights/${type}`)
// 所有角色数据列表(注意：每个角色里面包含了对应权限)
export const getRolesListRequest = () => axios.get('roles')
// 删除指定id角色的某个权限
export const deleteRightByIdRequest = (roleId, rightId) => axios.delete(`roles/${roleId}/rights/${rightId}`)
// 对指定id角色分配若干权限
export const allotRightsByIdRequest = (roleId, checkedRightIdsStr) => axios.post(`roles/${roleId}/rights`,
  {
    rids: checkedRightIdsStr
  }
)
// 添加角色
export const addRoleRequest = addRoleForm => axios.post('roles', addRoleForm)
// 根据指定id查询角色数据
export const getRoleRequest = roleId => axios.get(`roles/${roleId}`)
// 根据指定id和相关参数修改角色
export const editRoleRequest = editRoleForm => axios.put(`roles/${editRoleForm.roleId}`,
  {
    roleName: editRoleForm.roleName,
    roleDesc: editRoleForm.roleDesc
  }
)
// 根据指定id删除角色
export const deleteRoleRequest = roleId => axios.delete(`roles/${roleId}`)
// ------------------------------------------------------------------------------
// 获取所有商品分类数据列表(type已默认为3)
export const getCategoriesRequest = queryObj => axios.get('categories',
  {
    // get请求体携带参数，必须是一个params属性对象
    params: queryObj
  }
)
// 通过type获取 指定层级的商品分类数据列表
export const getCategoriesByTypeRequest = type => axios.get('categories',
  {
    params: {
      // type值 1，2，3     3表示所有分类；2表示一级、二级分类；1表示三级分类
      type
    }
  }
)
// 添加分类
export const addCateRequest = addCateForm => axios.post('categories', addCateForm)
// 根据指定id查询分类
export const getCateRequest = cateId => axios.get(`categories/${cateId}`)
// 根据指定id和相关参数修改分类
export const editCateRequest = editCateForm => axios.put(`categories/${editCateForm.cat_id}`,
  {
    cat_name: editCateForm.cat_name
  }
)
// 根据指定id删除分类
export const deleteCateRequest = cateId => axios.delete(`categories/${cateId}`)
