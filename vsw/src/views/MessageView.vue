<script>
import toLogin from '@/utils/toLogin'
import axios from "axios";

export default {
  props: {
    existNewMessage: Boolean
  },
  data() {
    return {
      userid: '',
      timer: '',
      messageList: {}
    }
  },
  computed:{
    content(){
      return (type) =>{
        switch (type){
        case 1:
          return "赞了你的作品"
        case 2:
          return "关注了你"
      }
      }


    }
  },
  mounted() {
    this.userid = -1
    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }
    this.getMessageList()


//结束轮询清除定时器
    //window.clearInterval(this.timer)
  },
  methods: {

    login() {
      toLogin.$emit('log')
    },
    checkNewMessage() {
      axios.post(`message/check/${this.userid}`)

    },
    getMessageList() {
      axios.get(`message/all/${this.userid}`).then((response) => {
        if (response.data.code === 1) {
          this.messageList = response.data.data
          if (this.existNewMessage) {
            this.checkNewMessage()
            this.$emit("checkNew")
          }
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
        头像
        {{ item.senderId }}
        {{content(item.type)}}
        {{ item.content }}
        {{ item.time }}
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