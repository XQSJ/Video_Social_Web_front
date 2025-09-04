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

</style>
