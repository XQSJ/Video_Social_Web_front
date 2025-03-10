<script>
  export default {
    data(){
      return{
        chatList:{
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
    }
  }
</script>

<template>
  <div>
    <div v-for="(chat, index) in chatList" style="height:50px">
      <el-row >
        <el-col :span="4">
          头像
        </el-col>
        <el-col :span="16">
          <el-row>
            {{chat.username}}
          </el-row>
          <el-row>
            <el-col :span="12">
              {{chat.message}}
            </el-col>
            <el-col :span="8">
              {{chat.time}}
            </el-col>
          </el-row>
        </el-col>
      </el-row>




    </div>
    <div style="text-align: center">
      暂时没有更多了
    </div>
  </div>

</template>

<style scoped lang="stylus">

</style>