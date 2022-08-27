// 封装axios请求

// 引入axios配置文件
import axios from './axios_config'

// 登录   请求api                                'login'为请求路径
export const loginRequest = loginForm => axios.post('login', loginForm)
// 左侧菜单列表  请求api
export const getMenuListRequest = () => axios.get('menus')
// 用户数据列表  请求api
export const getUsersListRequest = queryObj => axios.get('users',
  { // 💥注意：axios的get请求，必须传入一个含有params属性对象的对象
    params: {
      ...queryObj
    }
  }
)
// 修改更新用户数据的状态  请求api
export const updateUserStateRequest = userInfo => axios.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
// 添加用户  请求api
export const addUserRequest = addForm => axios.post('users', addForm)
// 根据指定id查询用户  请求api
export const getUserRequest = id => axios.get(`users/${id}`)
// 根据指定id和相关参数修改用户  请求api
export const editUserRequest = editForm => axios.put(`users/${editForm.id}`,
  {
    email: editForm.email,
    mobile: editForm.mobile
  }
)
// 根据指定id删除用户
export const deleteUserRequest = id => axios.delete(`users/${id}`)
