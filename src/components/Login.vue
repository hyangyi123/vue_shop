<template>
  <div class="login_container">
      <div class="login_box">
        <!-- 头像区域 -->
        <div class="avatar">
          <img src="../assets/荷鲁斯之眼.jpg" alt="">
        </div>
        <!-- 表单区域 -->
        <!-- 对登录表单进行数据绑定、规则验证 -->
        <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" status-icon class="form">
          <el-form-item prop="username">
            <!-- 输入框增加icon字体图标   方式一：prefix/suffix-icon属性 -->
            <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <!-- 输入框增加icon字体图标   方式二：i标签的slot属性、class -->
            <el-input v-model="loginForm.password" @keyup.enter="login" type="password" placeholder="请输入密码">
              <i slot="prefix" class="el-input__icon el-icon-lock"></i>
            </el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="info" @click="resetForm">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  data () {
    const checkpass = (rule, value, callback) => {
      // 配置正则表达式
      const patrn = /^[A-z0-9_]+$/
      if (value === '') {
        callback(new Error('密码不能为空！'))
      } else if (!patrn.test(value)) {
        callback(new Error('必须由字母、数字、下划线组成，不能含有其它非法符号'))
      } else {
        callback()
      }
    }

    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 登录表单的规则验证对象
      loginFormRules: {
        // 校验用户名
        username: [
          { required: true, message: '用户名不能为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        // 校验密码
        password: [
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' },
          // 采用自定义验证规则
          { validator: checkpass, trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置按钮的回调
    resetForm () {
      // 进行表单重置
      this.$refs.loginFormRef.resetFields()
    },
    // 登录按钮的回调
    login () {
      // 进行表单统一预验证
      this.$refs.loginFormRef.validate(async valid => {
        // 验证不通过
        if (!valid) return false

        // 验证通过 axios发送登录请求           login为请求路径
        const {data: res} = await this.$http.post('login', this.loginForm)
        // 这里 解构data 并重命名为res
        if (res.meta.status !== 200) return this.$message.error('登录失败！')
        this.$message.success('登录成功！')
        /*
        ⭐注意事项
        1.在登录成功之后，将服务器端生成并返回的 token 保存在客户端的 sessionStorage中
          1.1 项目中除了登录之外的其它API接口，必须在登录成功后才能访问 (通过 提供token 确定当前已登录成功)
          1.2 由于 token 保存在客户端的 sessionStorage 中，所以 token 只能在网页打开期间生效，一旦关闭浏览器就会失效
        2.跳转到后台首页，路由地址为 '/home'
      */
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
  .login_container {
    background-color:#0076b0;
    height: 100%;

    .login_box {
      width: 450px;
      height: 300px;
      background-color: #FFF;
      border-radius: 5px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      .avatar {
        width: 130px;
        height: 130px;
        border-radius: 50%;
        border: 2px solid #4b1344;
        overflow: hidden;
        padding: 5px;
        box-shadow: 0 0 5px #fa32ac;
        // 调整位置方法
        position: absolute;
        left: 50%;
        transform: translate(-50%, -40%);
        background-color: #FFF;
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
        }
      }
      .form {
        position: absolute;
        bottom: 0;
        width: 100%;
        // 这里表单超出了是因为 表单的box-sizing默认为 content-box
        padding: 0 20px;
        box-sizing: border-box;
        .btns {
          // 弹性模型
          display: flex;
          // 居中对齐
          justify-content: center;
       }
      }
    }
  }
</style>
