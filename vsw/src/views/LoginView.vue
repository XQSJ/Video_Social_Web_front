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
      this.isRegister = false;
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
              this.$message.error('response.data.data');
              console.log(response.data.data)
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
                  //window.location.href = window.location.href
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

      await axios
          .get(`/users/${userId}`)
          .then((response) => {
            if (response.data.code === 1) {
              let userInfo = response.data.data
              localStorage.setItem("userInfo", JSON.stringify(userInfo));
              localStorage.setItem("isLogin", "1");
              this.$router.go(0)
              this.$store.state.userInfo = userInfo;
            } else {
              this.$message.error('response.data.data');
              console.log(response.data.data)
            }


            //console.log(localStorage.getItem("userInfo"))
          })
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
  <div v-loading="loading">
    <div v-show="!isRegister">
      登录<br>
      账户
      <el-input v-model.trim="userId" placeholder="请输入账户" clearable></el-input>
      密码
      <el-input v-model.trim="userPwd" placeholder="请输入密码" clearable></el-input>
      <el-button @click="handleRegisterButton">注册</el-button>
      <el-button @click="verifyLogin" :disabled="!this.loginButton">登录</el-button>

    </div>
    <div v-show="isRegister">
      <el-button @click="isRegister=false">返回</el-button>
      注册<br>
      用户名
      <el-input v-model.trim="registerName" placeholder="请输入用户名" clearable></el-input>
      密码
      <el-input v-model.trim="registerPwd" placeholder="请输入密码" clearable></el-input>
      <el-button @click="Register" :disabled="!this.registerButton">注册</el-button>
    </div>

  </div>
</template>

<style scoped lang="stylus">

</style>