<template>
  <el-container>
    <!-- 页面头部区域 -->
    <el-header>
      <div>
        <img src="../assets/1.png" width="50px" height="50px" alt="" />
        <span>商品后台管理系统</span>
      </div>
      <el-button type="danger" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主要区域 -->
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠菜单按钮 -->
        <div class="toggleButton" @click="isCollapse = !isCollapse">{{ isCollapse ? '⇛' : '⇚' }}</div>
        <!-- 菜单区域 -->
        <el-menu
          background-color="#252627"
          text-color="#fff"
          active-text-color="#0fb4d0"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
        >
          <!-- 一级菜单 注意：这里index接收的是字符串-->
          <el-submenu :index="`${submenu.id}`" v-for="submenu in menuList" :key="submenu.id">
            <template slot="title">
              <i :class="iconsSet[submenu.id]"></i>
              <span>{{ submenu.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="`/${menuItem.path}`" v-for="menuItem in submenu.children" :key="menuItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ menuItem.authName }}</span>
                <!-- 正常写法是通过给每个菜单子项添加一个路由链接，实现路由跳转 -->
                <!-- <router-link :to="`/${menuItem.path}`" tag="span">{{ menuItem.authName }}</router-link> -->
                <!-- 而Menu提供了一种方法 通过router属性，以子菜单 index 作为 path 进行路由跳转 -->
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 内容区域 -->
      <el-main>
        <!-- 路由视窗 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script type="text/ecmascript-6">
// 引入相应的api请求
import { getMenuList } from '../api'
export default {
  data () {
    return {
      menuList: [],
      // 集合：一级菜单的id作为键，对应字体图标作为值
      iconsSet: {
        125: 'el-icon-s-custom',
        103: 'el-icon-key',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-management',
        145: 'el-icon-s-data'
      },
      isCollapse: false
    }
  },
  // 页面一加载，就获取左侧菜单列表
  created () {
    this.getMenu()
  },
  methods: {
    // 退出按钮的回调
    logout () {
      // 清空sessionStorage
      window.sessionStorage.clear()
      // 跳转到登录页面
      this.$router.push('/login')
    },
    // 获取左侧菜单列表
    async getMenu () {
      const {data: res} = await getMenuList()
      // 请求失败
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      // 请求成功
      this.menuList = res.data
      console.log(this.menuList)
    }
  }
}
</script>

<style lang="less" scoped>
  .el-container {
    height: 100%;
    // 头部区域
    .el-header {
      background-image: linear-gradient(
        to right,
        #09bace,
        #308ad7,
        #614ce1,
        #7d2ae8
      );
      display: flex;
      /* 靠边对齐 */
      justify-content: space-between;
      padding-left: 0;
      /* 按钮上下贴边取消 */
      align-items: center;
      color: #fff;
      font-size: 20px;
      div {
        display: flex;
        align-items: center;
        span {
          margin-left: 15px;
        }
      }
    }
    // 侧边栏区域
    .el-aside {
      background-color: #252627;
      .el-menu {
        border: 0px;
        .el-icon {
          margin-right: 10px;
        }
      }
      .toggleButton {
        text-align: center;
        font-size: 20px;
        font-weight: bolder;
        color: rgb(237, 209, 87);
        letter-spacing: 0.3em;
        line-height: 24px;
        cursor: pointer;
        background-color: #9daad5;
      }
    }
    // 内容区域
    .el-main {
      background-color: #ebecf0;
    }
  }

</style>
