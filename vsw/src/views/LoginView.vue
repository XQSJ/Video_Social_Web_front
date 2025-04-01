<script>
import axios from "axios";
import toMainUI from '@/utils/LoginViewToMainUIView';

export default {
  data() {
    return {
      userId: '',
      userPwd: '',
      loginButton: false,
      registerButton: false,
      loading: false,
      isRegister: false,
      registerName: '',
      registerPwd: '',
      registerId: ''
    }
  },
  methods: {
    goBackToLogin(){
      this.isRegister=false
    },
    handleRegisterButton() {
      this.registerName = ''
      this.registerPwd = ''
      this.registerId = ''
      this.isRegister = true;
    },
    async Register() {
      let userRegister = {
        "userName": this.registerName,
        "userPwd": this.registerPwd
      }
      this.loading = true;
      let _this = this;
      await axios.post('/users/register', userRegister)
          .then(response => {
            if(response.data.code===1){
              setTimeout(() => {
                this.loading = false;
                _this.registerId = response.data.data;
                _this.$message("你的用户id为：" + this.registerId);
              }, 500)
            }else{
              this.$message.error('response.data.data');
              console.log(response.data.data)
            }

          })
      this.userId = '';
      this.userPwd = ''
     // this.isRegister = false;
    },
    async verifyLogin() {
      let userLogin = {
        userId: this.userId,
        userPwd: this.userPwd
      }
      this.loading = true;
      let _this = this;
      await axios.post('/users/login', userLogin)
          .then(response => {
            //console.log(response.data)
            if (response.data.code === 1) {
              setTimeout(() => {
                this.loading = false;
                judge()
              }, 500)
            } else {
              this.$message.error(response.data);
              console.log(response.data)
              this.loading = false;
            }


            function judge() {
              switch (response.data.code) {
                case 1: {
                  console.log("登录成功")
                  _this.$message('登录成功');
                  // this.getUser(response.data.userId);

                  _this.getLoginUser(userLogin.userId);

                  setTimeout(() => {
                    toMainUI.$emit('login');    //调用mainUi的关闭登录弹窗
                  }, 500);

                  break;
                }
                case 20004: {  //用户不存在
                  console.log("error: 用户不存在");
                  _this.$message('用户不存在');
                  break;
                }
                case 20002: {  //用户不存在
                  console.log("error: 账号不存在或密码错误")
                  _this.$message('账号不存在或密码错误');
                  break;
                }
              }
            }
          })
          .catch(error => {
          })
    },

    async getLoginUser(userId) {
      let user = await this.getUser(userId);
      if (user.avatar !== null) {
        await axios.get(`/image/getUrl/${user.avatar}`).then((response) => {
          user.avatar = response.data.data
        })
      }
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("isLogin", "1");
      this.$router.go(0)
      this.$store.state.userInfo = user;
    }
  },
  watch: {
    userId(newValue, oldValue) {

      if (this.userId !== "" && this.userPwd !== "") {
        this.loginButton = true
      } else {
        this.loginButton = false
      }
    },
    userPwd(newValue, oldValue) {

      if (this.userId !== "" && this.userPwd !== "") {
        this.loginButton = true
      } else {
        this.loginButton = false
      }
    },
    registerName(newValue, oldValue) {
      if (this.registerName !== "" && this.registerPwd !== "") {
        this.registerButton = true
      } else {
        this.registerButton = false
      }
    },
    registerPwd(newValue, oldValue) {
      if (this.registerName !== "" && this.registerPwd !== "") {
        this.registerButton = true
      } else {
        this.registerButton = false
      }
    }
  }
}
</script>

<template>
<!--  <div v-loading="loading">-->
<!--    <div v-show="!isRegister">
      登录<br>
      账户
      <el-input v-model.trim="userId" placeholder="请输入账户" clearable></el-input>
      密码
      <el-input v-model.trim="userPwd" placeholder="请输入密码" clearable></el-input>
      <el-button @click="handleRegisterButton">注册</el-button>
      <el-button @click="verifyLogin" :disabled="!this.loginButton">登录</el-button>

    </div>-->

    <div class="login-register-wrapper" v-loading="loading" element-loading-text="正在处理..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.7)">
      <!-- 使用 el-card 增强视觉效果 -->
      <el-card class="box-card">
<!--        &lt;!&ndash; 使用 transition 实现切换动画 &ndash;&gt;
        <transition name="fade" mode="out-in">-->
<!--     登录表单 (v-if 控制显示)-->
    <div v-if="!isRegister" key="login">
      <div class="form-header">
        <h2 class="form-title">用户登录</h2>
      </div>
      <!-- 使用 el-form 组织表单 -->
      <el-form label-position="top">
        <el-form-item label="用户 ID">
          <el-input
              oninput="value=value.replace(/[^\d.]/g,'')"
              v-model.trim="userId"
              placeholder="请输入用户 ID"
              clearable
              prefix-icon="el-icon-user">
          </el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
              v-model.trim="userPwd"
              placeholder="请输入密码"
              clearable
              show-password
              prefix-icon="el-icon-lock">
          </el-input>
        </el-form-item>
        <el-form-item class="button-group">
          <!-- 登录按钮，禁用状态绑定到计算属性 -->
          <el-button
              type="primary"
              :disabled="!loginButton"
              style="width: 100%;"
              @click="verifyLogin">
            登 录
          </el-button>
          <!-- 切换到注册的文字按钮 -->
          <el-button type="text" @click="handleRegisterButton" class="switch-button">
            没有账户？前往注册
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-show="isRegister">
      <div class="form-header">
        <!-- 返回登录按钮 -->
        <el-button type="text" icon="el-icon-arrow-left" @click="goBackToLogin" class="back-button">
          返回登录
        </el-button>
        <h2 class="form-title">用户注册</h2>
      </div>

<!--
      用户名
      <el-input v-model.trim="registerName" placeholder="请输入用户名" clearable></el-input>
      密码
      <el-input v-model.trim="registerPwd" placeholder="请输入密码" clearable></el-input>
      <el-button @click="Register" :disabled="!this.registerButton">注册</el-button>
-->

      <!-- 使用 el-form 组织表单 -->
      <el-form label-position="top" @submit.native.prevent="Register">
        <el-form-item label="用户名">
          <el-input
              v-model.trim="registerName"
              placeholder="设置一个用户名"
              clearable
              prefix-icon="el-icon-user-solid">
          </el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
              v-model.trim="registerPwd"
              placeholder="设置密码"
              clearable
              show-password
              prefix-icon="el-icon-lock">
          </el-input>
        </el-form-item>
        <el-form-item class="button-group">
          <!-- 注册按钮，禁用状态绑定到计算属性 -->
          <el-button
              type="success"
              native-type="submit"
              :disabled="!this.registerButton"
              style="width: 100%;">
            注 册
          </el-button>
          <!-- 注册成功后显示用户ID提示 -->
          <div v-if="registerId" class="register-success-info">
            注册成功！您的ID是: <strong>{{ registerId }}</strong>，请牢记并使用ID登录。
          </div>
        </el-form-item>
      </el-form>
    </div>
<!--        </transition>-->
      </el-card>
  </div>
</template>

<style scoped lang="stylus">
// --- 整体布局与卡片样式 ---
.login-register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  // 如果需要在弹窗内，高度可能由弹窗控制
  // min-height: 400px; /* 可以设置最小高度 */
}

.box-card {
  width: 400px;       /* 固定宽度 */
  padding: 20px;      /* 卡片内边距 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  overflow: hidden; /* 防止内容溢出 */
}

// --- 表单头部样式 ---
.form-header {
  display: flex;
  align-items: center; /* 垂直居中 */
  margin-bottom: 25px; /* 与下方表单间距 */
  position: relative;  /* 用于返回按钮绝对定位 */
}

.form-header .form-title {
  margin: 0 auto;      /* 标题水平居中 */
  font-size: 22px;     /* 标题字号 */
  font-weight: 600;    /* 标题字重 */
  color: #303133;      /* 标题颜色 */
}

.form-header .back-button {
  position: absolute;  /* 绝对定位 */
  left: -10px;         /* 调整水平位置 */
  top: 50%;            /* 垂直居中 */
  transform: translateY(-50%); /* 精确垂直居中 */
  padding: 0 10px;     /* 按钮内边距 */
  font-size: 14px;     /* 按钮字号 */
  color: #409EFF;      /* 按钮颜色 */
}
.form-header .back-button:hover {
  color: #66b1ff;
}


// --- 表单项与输入框样式 ---
.el-form-item {
  margin-bottom: 20px; /* 表单项间距 */
}

/* 修改 Element UI 默认 label 样式 */
.el-form-item >>> .el-form-item__label { /* 深度选择器 */
  padding-bottom: 5px; /* 标签与输入框间距 */
  line-height: 1.5;    /* 行高 */
  font-weight: 500;    /* 字体加粗 */
  color: #606266;      /* 标签颜色 */
}

/* 修改 Element UI 默认 input 样式 */
.el-input >>> .el-input__inner { /* 深度选择器 */
  border-radius: 4px; /* 输入框圆角 */
  transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1); /* 过渡效果 */
}

.el-input >>> .el-input__inner:focus {
  border-color: #409EFF; /* 输入框聚焦时边框颜色 */
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2); /* 聚焦时外发光效果 */
}

.el-input >>> .el-input__prefix .el-input__icon {
  color: #C0C4CC; /* 图标颜色 */
}

// --- 按钮组与按钮样式 ---
.button-group {
  margin-top: 30px; /* 按钮组与上方表单项的距离 */
}

.button-group .el-button {
  font-size: 16px;    /* 按钮字号 */
  border-radius: 4px; /* 按钮圆角 */
  padding: 12px 20px; /* 按钮内边距 */
}

/* 切换注册/登录的文字按钮样式 */
.switch-button {
  display: block;      /* 独占一行 */
  margin: 15px auto 0; /* 上方间距，水平居中 */
  font-size: 14px;     /* 字号 */
  color: #409EFF;      /* 颜色 */
  padding: 0;          /* 去除文字按钮默认padding */
  line-height: 1;      /* 调整行高 */
}

.switch-button:hover {
  color: #66b1ff;      /* 悬停颜色 */
}

// --- 注册成功提示信息样式 ---
.register-success-info {
  margin-top: 15px;      /* 与上方按钮间距 */
  padding: 10px;         /* 内边距 */
  background-color: #f0f9eb; /* 成功背景色 */
  color: #67c23a;         /* 成功文字颜色 */
  border: 1px solid #e1f3d8; /* 边框颜色 */
  border-radius: 4px;      /* 圆角 */
  text-align: center;      /* 文字居中 */
  font-size: 14px;         /* 字号 */
}

.register-success-info strong {
  font-weight: bold;     /* ID 加粗 */
}

// --- 切换动画 ---
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s ease; /* 透明度过渡 */
}

.fade-enter, .fade-leave-to /* .fade-leave-active in <2.1.8 */ {
  opacity: 0; /* 进入前和离开后透明度为0 */
}
</style>