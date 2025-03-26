<script >
  import axios from "axios";
  export default {
    data(){
      return{
        userId: '',
        userPwd:'',
        loginButton:false
      }
    },
    methods:{
      verifyLogin(){
          let userInfo={
            userId :this.userId,
            userPwd: this.userPwd
          }
          console.log("登录："+userInfo)
          axios.post('http://localhost:8080/users/login',userInfo)
              .then(response=>{

              }).catch(error=>{

          })
          localStorage.setItem("userInfo",JSON.stringify(userInfo));
          this.$store.state.userInfo=userInfo

      },



    },
    watch:{
      userId(newValue,oldValue){

        if(this.userId!==""&&this.userPwd!==""){
          this.loginButton = true
        }else{
          this.loginButton = false
        }
      },
      userPwd(newValue,oldValue){

        if(this.userId!==""&&this.userPwd!==""){
          this.loginButton = true
        }else{
          this.loginButton = false
        }
      }
    }
  }
</script>

<template>
    <div>
      登录<br>
      账户<el-input v-model.trim="userId" placeholder="请输入账户"  clearable></el-input>
      密码<el-input v-model.trim="userPwd" placeholder="请输入密码"  clearable></el-input>
      <el-button @click="verifyLogin" :disabled="!this.loginButton">登录</el-button>

    </div>
</template>

<style scoped lang="stylus">

</style>