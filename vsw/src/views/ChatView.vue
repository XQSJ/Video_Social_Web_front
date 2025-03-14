<script>
export default {
  data() {
    return {
      aMessage: '',
      isChating: false,
      chatList: {
        chat1: {
          userid: 1111,
          username: '32432',
          profile: '',
          time: 'friday',
          message: 'hhh'
        },
        chat2: {}
      },
      achat: {
        userid: '',
        username: '',
        profile: '',
        chatinfo: {}
      }
    }
  },
  methods: {
    sendMessage(){
      //
      if(1){ //若发送成功

      }else{  //若未发送成功

      }
       this.aMessage=''
    },
    toChat(userid, username) {
      //根据userid查询信息
      //赋值信息
      this.achat.username = username
      //将信息显示
      this.isChating = true; //开启聊天
    }
  }
}
</script>

<template>
  <div>
    <div v-show=!isChating>
      <div v-for="(chat, index) in chatList" style="height:50px" @click="toChat(chat.userid,chat.username)">
        <el-row>
          <el-col :span="4">
            头像
          </el-col>
          <el-col :span="16">
            <el-row>
              {{ chat.username }}
            </el-row>
            <el-row>
              <el-col :span="12">
                {{ chat.message }}
              </el-col>
              <el-col :span="8">
                {{ chat.time }}
              </el-col>
            </el-row>
          </el-col>
        </el-row>


      </div>
      <div style="text-align: center">
        暂时没有更多了
      </div>
    </div>
    <div v-show="isChating" style="width:100%;height: 100%">
      <el-container>
        <el-header>
          <el-button @click="isChating=false;aMessage=''">
            back
          </el-button>
          {{ this.achat.username }}
          <el-button>
            设置
          </el-button>
        </el-header>
        <el-main>

        </el-main>
        <el-footer>
          <el-input v-model="aMessage">

          </el-input>
          <el-button @click="sendMessage">
            发送
          </el-button>
        </el-footer>
      </el-container>
    </div>
  </div>

</template>

<style scoped lang="stylus">

</style>