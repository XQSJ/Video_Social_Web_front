<script>
import axios from "axios";
import toMainUI from '@/utils/LoginViewToMainUIView';
import handleMainMenu from "@/utils/handleMainMenu";
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
       /* await axios.get(`/image/getUrl/${user.avatar}`).then((response) => {
          user.avatar = response.data.data
        })*/
      }
      localStorage.setItem("userInfo", JSON.stringify(user));
      localStorage.setItem("isLogin", "1");
      this.$router.go(0)
      this.$store.state.userInfo = user;
    },
    closeLogView(){
      handleMainMenu.$emit('closeLogView')
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
  <!--  HTML 结构保持不变 -->
  <div class="login-register-wrapper" v-loading="loading" :element-loading-text="loadingText" element-loading-spinner="el-icon-loading" :element-loading-background="loadingBackground">
    <el-card class="box-card">
      <!--
        将 el-button 的 type="primary" (如果之前有) 或 type="success" (注册按钮)
        移除或改为一个不带特定颜色的类型 (如默认类型)，然后通过自定义 class 来应用抖音红。
        或者，如下方 CSS 所示，直接覆盖 Element UI 的 .el-button--primary 和 .el-button--success。
      -->
      <el-button @click="closeLogView()" class="top-close-button">关闭</el-button>
      <div v-if="!isRegister" key="login">
        <div class="form-header">
          <h2 class="form-title">用户登录</h2>
        </div>
        <el-form label-position="top" @submit.native.prevent="verifyLogin">
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
            <el-button
                type="primary"
            :disabled="!loginButton"
            style="width: 100%;"
            native-type="submit"
            @click="verifyLogin">
            登 录
            </el-button>
            <el-button type="text" @click="handleRegisterButton" class="switch-button">
              没有账户？前往注册
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <div v-else key="register">
        <div class="form-header">
          <el-button type="text" icon="el-icon-arrow-left" @click="goBackToLogin" class="back-button">
            返回登录
          </el-button>
          <h2 class="form-title">用户注册</h2>
        </div>
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
            <el-button
                type="primary"
            native-type="submit"
            :disabled="!this.registerButton"
            style="width: 100%;">
            注 册
            </el-button>
            <div v-if="registerId" class="register-success-info">
              注册成功！您的ID是: <strong>{{ registerId }}</strong>，请牢记并使用ID登录。
            </div>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>


<style>
  /* --- CSS 自定义属性 (抖音红风格 - 纯 CSS 版本) --- */
:root {
  --font-family-douyin: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --color-text-primary: #161823;
  --color-text-secondary: #6F7581;
  --color-text-placeholder: #A0A7B3;
  --color-text-link-douyin: #FE2C55; /* 抖音红用于链接 */
  --color-background-card: #FFFFFF;
  --color-background-input: #F2F3F5;

  --color-button-primary-douyin: #FE2C55; /* 主要按钮颜色 (抖音红) */
  --color-button-primary-douyin-hover: #E4234A;
  --color-button-primary-douyin-disabled: #FD9AAE;

  --color-border-input: #E5E6EB;
  --color-border-input-focus-douyin: #FE2C55; /* 输入框聚焦边框 (抖音红) */

  --color-close-button-bg: #F2F3F5;
  --color-close-button-text: #4E5969;
  --color-close-button-border: #E5E6EB;

  --border-radius-card: 8px;
  --border-radius-input: 6px;
  --box-shadow-card: 0px 6px 16px -2px rgba(22, 24, 35, 0.08), 0px 4px 8px -4px rgba(22, 24, 35, 0.05);

  /* 加载动画相关颜色 */
  --loading-mask-background-color: rgba(0, 0, 0, 0);
  --loading-spinner-color: var(--color-button-primary-douyin);
  --loading-text-color: var(--color-text-primary);
}

/* --- 整体布局与卡片样式 --- */
.login-register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: var(--font-family-douyin);
  background-color: #000000;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
}

.box-card {
  width: 380px;
  padding: 32px;
  border-radius: var(--border-radius-card);
  box-shadow: var(--box-shadow-card);
  background-color: var(--color-background-card);
  position: relative;
}

.top-close-button.el-button { /* 需要 :deep 如果 scoped */
  position: absolute;
  top: 28px;
  left: 32px;
  padding: 6px 12px !important;
  border: 1px solid var(--color-close-button-border) !important;
  background-color: var(--color-close-button-bg) !important;
  color: var(--color-close-button-text) !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  border-radius: var(--border-radius-input) !important;
  min-height: auto !important;
  line-height: normal !important;
}
.top-close-button.el-button:hover,
.top-close-button.el-button:focus {
  background-color: #E5E6EB !important;
  border-color: #DCDFE6 !important;
  color: var(--color-text-primary) !important;
}

.form-header {
  text-align: center;
  margin-bottom: 32px;
  position: relative;
}

.form-header .form-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 28px;
}

.form-header .back-button.el-button--text { /* 需要 :deep 如果 scoped */
  position: absolute;
  left: -10px;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 10px !important;
  font-size: 14px !important;
  color: var(--color-text-secondary) !important;
  min-height: auto !important;
  background-color: transparent !important;
}
.form-header .back-button.el-button--text:hover,
.form-header .back-button.el-button--text:focus {
  color: var(--color-text-primary) !important;
  background-color: transparent !important;
}
.form-header .back-button.el-button--text i {
  font-weight: bold;
}

.el-form-item {
  margin-bottom: 20px;
}

/* 如果是 scoped CSS, 以下所有 .el-form-item__label, .el-input__inner 等都需要 :deep() */
.el-form-item__label {
  padding-bottom: 8px !important;
  line-height: 1.5 !important;
  font-weight: 500 !important;
  color: var(--color-text-primary) !important;
  font-size: 14px !important;
}

.el-input__inner {
  background-color: var(--color-background-input) !important;
  border-radius: var(--border-radius-input) !important;
  border: 1px solid var(--color-border-input) !important;
  height: 44px !important;
  line-height: 44px !important;
  padding: 0 12px 0 40px !important;
  font-size: 14px !important;
  color: var(--color-text-primary) !important;
  transition: border-color 0.2s ease-in-out, background-color 0.2s ease-in-out !important;
}
.el-input__inner::placeholder {
  color: var(--color-text-placeholder) !important;
}
.el-input__inner:focus {
  border-color: var(--color-border-input-focus-douyin) !important; /* 抖音红边框 */
  background-color: var(--color-background-card) !important;
  box-shadow: none !important;
}

.el-input__prefix {
  left: 12px !important;
  display: flex !important;
  align-items: center !important;
}
.el-input__icon {
  color: var(--color-text-secondary) !important;
  font-size: 16px !important;
  width: auto !important;
}
.el-input__suffix {
  right: 12px !important;
  display: flex !important;
  align-items: center !important;
}
.el-input__suffix-inner .el-input__icon {
  color: var(--color-text-secondary) !important;
  cursor: pointer !important;
}
.el-input__suffix-inner .el-input__icon:hover {
  color: var(--color-text-primary) !important;
}

.button-group {
  margin-top: 24px;
}

/* --- 覆盖 Element UI 默认按钮颜色 --- */
/* 主要按钮 (type="primary") */
.el-button--primary { /* 需要 :deep 如果 scoped */
  background-color: var(--color-button-primary-douyin) !important;
  border-color: var(--color-button-primary-douyin) !important;
  color: #fff !important;
  box-shadow: 0 2px 8px rgba(254, 44, 85, 0.2) !important;
}
.el-button--primary:hover,
.el-button--primary:focus {
  background-color: var(--color-button-primary-douyin-hover) !important;
  border-color: var(--color-button-primary-douyin-hover) !important;
  color: #fff !important;
}
.el-button--primary.is-disabled,
.el-button--primary.is-disabled:hover,
.el-button--primary.is-disabled:focus {
  background-color: var(--color-button-primary-douyin-disabled) !important;
  border-color: var(--color-button-primary-douyin-disabled) !important;
  color: #fff !important;
  box-shadow: none !important;
  opacity: 0.7 !important;
}

/* 文字按钮 (type="text") */
.el-button--text { /* 需要 :deep 如果 scoped */
  color: var(--color-text-link-douyin) !important;
  background-color: transparent !important;
  border-color: transparent !important;
}
.el-button--text:hover,
.el-button--text:focus {
  color: var(--color-button-primary-douyin-hover) !important; /* 也可以用链接的 hover 色 */
  background-color: transparent !important;
  border-color: transparent !important;
}


/* 您的自定义按钮样式 (如果与 Element UI 按钮类名不冲突) */
.button-group .el-button { /* 统一按钮高度和圆角 */
  width: 100%;
  height: 44px !important;
  border-radius: var(--border-radius-input) !important;
  font-size: 16px !important;
  font-weight: 500 !important;
  transition: background-color .2s ease !important;
}

.switch-button.el-button--text { /* 确保 switch-button 也是文字按钮样式 */
  display: block !important;
  margin: 16px auto 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
  min-height: auto !important;
}

.register-success-info {
  margin-top: 16px;
  padding: 10px 15px;
  background-color: #FFF1F3;
  color: var(--color-button-primary-douyin);
  border: 1px solid #FFE0E6;
  border-radius: var(--border-radius-input);
  text-align: center;
  font-size: 13px;
  line-height: 1.6;
}
.register-success-info strong {
  font-weight: 600;
}

/* --- 加载动画样式 (Element UI) --- */
/* v-loading 的 element-loading-background 是行内样式，CSS 变量无法直接作用。
   但我们可以覆盖遮罩本身的背景色。 */
.el-loading-mask { /* 需要 :deep 如果 scoped */
  border-radius: var(--border-radius-card) !important; /* 如果加载是针对卡片 */
  background-color: var(--loading-mask-background-color) !important;
}
.el-loading-spinner .el-icon-loading { /* 需要 :deep 如果 scoped */
  color: var(--loading-spinner-color) !important;
  font-size: 28px !important;
}
.el-loading-spinner .el-loading-text { /* 需要 :deep 如果 scoped */
  color: var(--loading-text-color) !important;
  font-size: 14px !important;
  margin-top: 6px !important;
}
</style>
