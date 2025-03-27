<script>
import axios from "axios";
import toMainUI from '@/utils/LoginViewToMainUIView';

export default {
  data() {
    return {
      userId: '',
      userPwd: '',
      loginButton: false,
      loading: false
    }
  },
  methods: {
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
            setTimeout(()=>{
              this.loading=false;
              judge()
            },500)

            function judge() {
              switch (response.data.code) {
                case 1: {
                  console.log("登录成功")
                  _this.$message('登录成功');
                  // this.getUser(response.data.userId);

                  _this.getLoginUser(userLogin.userId);
                  setTimeout(()=>{
                    toMainUI.$emit('login');    //调用mainUi的关闭登录弹窗
                  },500);
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

    async getLoginUser(userId){
      await axios
          .get(`/users/${userId}`)
          .then((response)=>{
            let userInfo = response.data.data
            localStorage.setItem("userInfo", JSON.stringify(userInfo));
            localStorage.setItem("isLogin", "1");
            this.$router.go(0)
            this.$store.state.userInfo = userInfo;

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
    }
  }
}
</script>

<template>
  <div v-loading="loading">
    登录<br>
    账户
    <el-input v-model.trim="userId" placeholder="请输入账户" clearable></el-input>
    密码
    <el-input v-model.trim="userPwd" placeholder="请输入密码" clearable></el-input>
    <el-button @click="verifyLogin" :disabled="!this.loginButton">登录</el-button>

  </div>
</template>

<style scoped lang="stylus">

</style>