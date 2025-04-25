<script>
import toLogin from '@/utils/toLogin'
import axios from "axios";
export default {
  data(){
    return{
      userid:'',
      timer:'',
      messageList:{
        chat1:{
          userid:1111,
          username:'32432',
          profile:'',
          time:'friday',
          message:'hhh'
        },
        chat2:{

        }
      }
    }
  },
  mounted() {
    console.log("messageView")
    this.userid = -1
    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }
    this.getMessageList()



//结束轮询清除定时器
    //window.clearInterval(this.timer)
  },
  methods:{
    login(){
      toLogin.$emit('log')
    },
    getMessageList() {
      axios.get(`message/all/${this.userid}`).then((response)=>{
          if(response.data.code===1){
              console.log(response.data.data)
          }
      })
    }
  }
}
</script>

<template>
  <div>
    <div v-if="userid!==-1">
      <div v-for="(item, index) in messageList" style="height:50px">
        <el-row >
          <el-col :span="4">
            头像
          </el-col>
          <el-col :span="16">
            <el-row>
              {{item.username}}
            </el-row>
            <el-row>
              <el-col :span="12">
                {{item.message}}
              </el-col>
              <el-col :span="8">
                {{item.time}}
              </el-col>
            </el-row>
          </el-col>
        </el-row>




      </div>
      <div style="text-align: center">
        暂时没有更多了
      </div>
    </div>
    <div v-if="userid===-1">
      <div>
        登录后即可查看通知消息
      </div>
      <el-button @click="login">立即登录</el-button>
    </div>
  </div>


</template>

<style scoped lang="stylus">

</style>