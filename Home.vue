<template>
  <el-row class="container">
    <!--头部-->
    <el-col :span="24" class="topbar-wrap">
      <div class="topbar-logo topbar-btn">
        <a href="/"
          ><img
            src="../../static/images/首页图片.png"
            style="padding-left: 0px"
        /></a>
      </div>
      <!-- <div class="topbar-logos" v-show="!collapsed">
        <a href="/"><img src="../assets/logotxt.png"></a>
      </div> -->
      <div class="topbar-title">
        <!-- <span style="font-size: 18px;color: #fff;">株洲市环境保护</span> -->
        <div class="menu" v-show="menu_show">
          <el-menu
            class="el-menu-demo"
            mode="horizontal"
            router
            @select="handleSelect"
            text-color="#000"
            background-color="#80bcf8"
            active-text-color="#ffd04b"
          >
            <template
              v-for="(item, index) in $router.options.routes"
              v-if="item.menuShow"
            >
              <el-submenu
                v-if="!item.leaf"
                :index="index + ''"
                style="top: -0.5em; position: relative"
              >
                <template slot="title">
                  <span slot="title">{{ item.name }}</span></template
                >
                <el-menu-item
                  v-for="term in item.children"
                  :key="term.path"
                  :index="term.path"
                  :class="$route.path == term.path ? 'is-active' : ''"
                >
                  <span slot="title">{{ term.name }}</span>
                </el-menu-item>
              </el-submenu>

              <el-menu-item
                v-else-if="item.leaf && item.children && item.children.length"
                :index="item.children[0].path"
                :class="$route.path == item.children[0].path ? 'is-active' : ''"
              >
                <i :class="item.iconCls"></i
                ><span slot="title">{{ item.children[0].name }}</span>
              </el-menu-item>
            </template>
          </el-menu>
        </div>
      </div>
      <div class="topbar-account topbar-btn">
        <!-- <el-input
          class="adimin"
          v-model="admin"
          placeholder="用户名"
          style="width: 200px"
          v-show="login_show"
        ></el-input>
        <el-input
          class="password"
          v-model="password"
          placeholder="密码"
          style="width: 200px"
          show-password
          v-show="login_show"
          >></el-input
        >
        <el-button
          type="success"
          class="login"
          @click="handleLogin"
          style="top: 0.4em; position: reletive"
          v-show="login_show"
          >登录</el-button
        > -->

        <el-form
          :inline="true"
          :model="formInline"
          ref="AccountFrom"
          class="demo-form-inline"
          v-show="login_show"
          style="position: relative; top: 0.3em"
        >
          <el-form-item label="账号">
            <el-input v-model="formInline.admin" placeholder="账号"></el-input>
          </el-form-item>
          <el-form-item label="密码">
            <el-input
              v-model="formInline.password"
              placeholder="密码"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="Login">登录</el-button>
          </el-form-item>
        </el-form>

        <el-dropdown trigger="click">
          <span class="el-dropdown-link userinfo-inner"
            ><i class="iconfont icon-user"></i> {{ nickname }}
            <i class="iconfont icon-down"></i
          ></span>

          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item>
              <div @click="jumpTo('/user/profile')">
                <span style="color: #555; font-size: 14px">个人信息</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item>
              <div @click="jumpTo('/user/changepwd')">
                <span style="color: #555; font-size: 14px">修改密码</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item divided @click.native="logout"
              >回到首页</el-dropdown-item
            >
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-col>

    <!--中间-->
    <el-col :span="24" class="main">
      <!--左侧导航-->
      <!-- <aside :class="{ showSidebar: !collapsed }" v-show="menu_show">
        <div class="menu-toggle" @click.prevent="collapse">
          <i class="iconfont icon-menufold" v-show="!collapsed"></i>
          <i class="iconfont icon-menuunfold" v-show="collapsed"></i>
        </div>

        <el-menu
          :default-active="defaultActiveIndex"
          router
          text-color="#000"
          background-color="#80bcf8"
          active-text-color="#ffd04b"
          :collapse="collapsed"
          @select="handleSelect"
        >
          <template
            v-for="(item, index) in $router.options.routes"
            v-if="item.menuShow"
          >
            <el-submenu v-if="!item.leaf" :index="index + ''">
              <template slot="title">
                <span slot="title">{{ item.name }}</span></template
              >
              <el-menu-item
                v-for="term in item.children"
                :key="term.path"
                :index="term.path"
                v-if="term.menuShow"
                :class="$route.path == term.path ? 'is-active' : ''"
              >
                <i :class="term.iconCls"></i
                ><span slot="title">{{ term.name }}</span>
              </el-menu-item>
            </el-submenu>
            <el-menu-item
              v-else-if="item.leaf && item.children && item.children.length"
              :index="item.children[0].path"
              :class="$route.path == item.children[0].path ? 'is-active' : ''"
            >
              <i :class="item.iconCls"></i
              ><span slot="title">{{ item.children[0].name }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </aside> -->

      <!--右侧内容区-->
      <section class="content-container">
        <div class="grid-content bg-purple-light">
          <el-col :span="24" class="content-wrapper">
            <transition name="fade" mode="out-in">
              <router-view></router-view>
            </transition>
          </el-col>
        </div>
      </section>
    </el-col>
  </el-row>
</template>

<script>
import { bus } from "../bus.js";
import API from "../api/api_user";
import { userLogin } from "../components/api/map_api/user";

export default {
  name: "home",
  created() {
    bus.$on("setNickName", (text) => {
      this.nickname = text;
    });

    bus.$on("goto", (url) => {
      if (url === "/login") {
        localStorage.removeItem("access-user");
      }
      this.$router.push(url);
    });
  },
  data() {
    return {
      defaultActiveIndex: "0",
      nickname: "",
      collapsed: false,
      admin: "",
      password: "",
      login_show: true,
      menu_show: false,
      menutype: 0,
      formInline: {
        admin: "",
        password: "",
      },
    };
  },
  methods: {
    handleSelect(index) {
      this.defaultActiveIndex = index;
    },
    //折叠导航栏
    collapse: function () {
      this.collapsed = !this.collapsed;
    },
    jumpTo(url) {
      console.log(url);
      this.defaultActiveIndex = url;
      this.$router.push(url); //用go刷新
    },
    logout() {
      // let that = this;
      // this.$confirm("确认退出吗?", "提示", {
      //   confirmButtonClass: "el-button--warning",
      // })
      //   .then(() => {
      //     //确认
      //     that.loading = true;
      //     API.logout()
      //       .then(
      //         function (result) {
      //           that.loading = false;
      //           localStorage.removeItem("access-user");
      //           that.$router.go("/login"); //用go刷新
      //         },
      //         function (err) {
      //           that.loading = false;
      //           that.$message.error({
      //             showClose: true,
      //             message: err.toString(),
      //             duration: 2000,
      //           });
      //         }
      //       )
      //       .catch(function (error) {
      //         that.loading = false;
      //         console.log(error);
      //         that.$message.error({
      //           showClose: true,
      //           message: "请求出现异常",
      //           duration: 2000,
      //         });
      //       });
      //   })
      //   .catch(() => {});
      this.loading = false;
      localStorage.removeItem("access-user");
      this.$router.go("/login"); //用go刷新
    },
    change_show() {
      this.$store.commit("setDemoValue", 1);
      if (this.admin === "root" && this.password === "root") {
        this.$store.commit("setRoot", 0);
      } else if (this.admin === "" && this.password === "") {
        this.$store.commit("setRoot", 2);
      }

      this.login_show = false;
      this.menu_show = true;
    },
    Login() {
      let that = this;
      this.$refs.AccountFrom.validate((valid) => {
        if (valid) {
          this.loading = true;
          let params = {
            username: this.formInline.admin,
            pwd: this.formInline.password,
          };

          if (
            this.formInline.admin === "root" &&
            this.formInline.password === "root"
          ) {
            this.$store.commit("setRoot", 0);
            this.$store.commit("setDemoValue", 1);
            this.login_show = false;
            this.menu_show = true;
          } else if (
            this.formInline.admin === "" &&
            this.formInline.password === ""
          ) {
            this.$store.commit("setRoot", 2);
            this.$store.commit("setDemoValue", 1);
            this.login_show = false;
            this.menu_show = true;
            // this.$message('空账号密码登录将于6.30日正式下线，请联系管理员注册账号密码。');
          } else {
            userLogin(params)
              .then((res) => {
                if (res.data.data) {
                  that.loading = false;
                  this.$store.commit("setDemoValue", 1);
                  this.$store.commit("setRoot", 1);
                  this.login_show = false;
                  this.menu_show = true;
                } else {
                  that.$message.error({
                    showClose: true,
                    message: "账号或密码错误",
                    duration: 2000,
                  });
                }
              })
              .catch(function (error) {
                that.loading = false;
                that.$message.error({
                  showClose: true,
                  message: "账号或密码错误",
                  duration: 2000,
                });
              });
          }
        }
      });
    },
  },
  watch: {
    menutype: {
      handler: function (newVal, oldVal) {
        this.$store.commit("menutype", newVal);
      },
    },
  },
  mounted() {
    let user = localStorage.getItem("access-user");
    if (user) {
      user = JSON.parse(user);
      this.nickname = user.nickname || "";
    }
  },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.container {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;

  .topbar-wrap {
    height: 50px;
    line-height: 50px;
    // background: #373d41;
    background: #80bcf8;
    padding: 0px;

    .topbar-btn {
      // color: #fff;
      color: #000;
    }
    /*.topbar-btn:hover {*/
    /*background-color: #4A5064;*/
    /*}*/
    .topbar-logo {
      float: left;
      width: 220px;
      line-height: 26px;
    }
    .topbar-logos {
      float: left;
      width: 120px;
      line-height: 26px;
    }
    .topbar-logo img,
    .topbar-logos img {
      height: 40px;
      margin-top: 5px;
      margin-left: 2px;
    }
    .topbar-title {
      float: left;
      text-align: left;
      width: 600px;
      padding-left: 10px;
      // border-left: 1px solid #000;
    }
    .topbar-account {
      float: right;
      padding-right: 12px;
    }
    .userinfo-inner {
      cursor: pointer;
      // color: #fff;
      color: #000;
      padding-left: 10px;
    }
  }
  .main {
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    position: absolute;
    top: 50px;
    bottom: 0px;
    overflow: hidden;
  }

  aside {
    min-width: 50px;
    // background: #333744;
    background: #80bcf8;
    &::-webkit-scrollbar {
      display: none;
    }

    &.showSidebar {
      overflow-x: hidden;
      overflow-y: auto;
    }

    .el-menu {
      height: 100%; /*写给不支持calc()的浏览器*/
      height: -moz-calc(100% - 80px);
      height: -webkit-calc(100% - 80px);
      height: calc(100% - 80px);
      border-radius: 0px;
      // background-color: #333744;
      background-color: #80bcf8;

      border-right: 0px;
    }

    .el-submenu .el-menu-item {
      min-width: 60px;
    }
    .el-menu {
      width: 180px;
    }
    .el-menu--collapse {
      width: 60px;
    }

    .el-menu .el-menu-item,
    .el-submenu .el-submenu__title {
      height: 46px;
      line-height: 46px;
    }

    .el-menu-item:hover,
    .el-submenu .el-menu-item:hover,
    .el-submenu__title:hover {
      // background-color: #7ed2df;//悬停颜色
      background-color: #e7d916;
    }
  }

  .menu-toggle {
    // background: #4a5064;
    background: #80bcf8;
    text-align: center;
    // color: white;
    color: black;
    height: 26px;
    line-height: 30px;
  }

  .content-container {
    background: #fff;

    flex: 1;
    overflow-y: auto;
    padding: 10px;
    padding-bottom: 1px;

    .content-wrapper {
      background-color: #fff;

      box-sizing: border-box;
    }
  }

  .menu {
    position: relative;
    left: 0em;
    float: left;
    top: 0.3em;
  }

  .admin {
    // float: left;

    // right: 12em;
    position: relative;
  }
  .password {
    // float: left;

    // right: 2em;
    position: relative;
  }
  #login {
    position: relative;
    float: left;
  }
}
</style>
