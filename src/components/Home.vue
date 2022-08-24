<template>
  <div>
    <el-button @click="logout">退出</el-button>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  methods: {
    // 退出按钮的回调
    logout () {
      // 清空sessionStorage
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    }
  }
}
</script>

<style scoped>

</style>
