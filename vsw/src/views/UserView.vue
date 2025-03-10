<script>
export default {
  data() {
    return {
      userid: '',
      userinfo: {
        name: '用户名111',
        profile: '',
        fansCount: 0,
        subscribeCount: 0,
        introduction: '自我介绍1'
      },
      editForm:{
          profile:'',
          name:'',
          introduction:''
      },
      option: '',
      videoList: {},
      userList: {
        user1: {
          name: "1"
        },
        user2: {
          name: "2"
        }
      },
      dialogVisible:{
        fans:false,
        editIntro:false
      },

      input_searchUser: ''
    }
  },
  mounted() {
    //将id赋值
    this.userid = this.$route.query.id
    //根据id查找其他值
    this.setinfo()
  },
  watch: {
    //监听路由更改时将id赋值
    '$route.query'(newId) {
      if (this.$route.name === 'user') {  //当路由为该界面时
        this.userid = newId.id //将传入的id赋值
        this.setinfo()//根据id查找其他值
      }

    }
  },
  methods: {
    handleCloseFans() {
      this.dialogVisible.fans = false
    },
    handleOpenFans(item) {
      this.dialogVisible.fans = true
    },
    handleCloseEdit() {
      this.dialogVisible.editIntro = false
    },
    handleOpenEdit() {
      this.dialogVisible.editIntro = true
      this.editForm.name=this.userinfo.name
      this.editForm.introduction=this.userinfo.introduction
      this.editForm.profile=this.userinfo.profile
    },
    editUserInfo(){
      //调用接口修改信息 ？？？

      //
      if(1){//修改成功后触发下列内容
        this.userinfo.name=this.editForm.name
        this.userinfo.introduction=this.editForm.introduction
        this.userinfo.profile=this.editForm.profile
        this.handleCloseEdit()
      }else{ //修改不成功？？？

      }

    },
    setinfo() {
      //根据id查询user基本信息

      //user信息赋值

      //搜索作品
      this.searchUserVideo('work')

    },
    searchUserVideo(option) {

      if (option !== this.option) { //当当前选项不为所选选项时才执行
        this.option = option
        console.log('执行搜索' + option)
        //执行搜索
      }
    },
    clearSearchUser() {

    }
  }

}
</script>

<template>
  <div style="height: 100%">
    <el-dialog :visible="this.dialogVisible.fans" :before-close="handleCloseFans" :destroy-on-close=true>
      <el-button>关注</el-button>
      <el-button>粉丝</el-button>
      <el-input placeholder="搜索用户名字或id" v-model="input_searchUser" clearable @clear="clearSearchUser">
      </el-input>
      <div v-for="(user, index) in userList">
        {{ user.profile }}
        {{ user.name }}
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" :visible="this.dialogVisible.editIntro" :before-close="handleCloseEdit" :destroy-on-close=true>
      <el-row>
          编辑资料
      </el-row>
      <el-row>
          头像
      </el-row>
      <el-row>
          名字
          <el-input placeholder="记得填写昵称" v-model="editForm.name"></el-input>
      </el-row>
      <el-row>
          简介
          <el-input placeholder="介绍一下你自己"  v-model="editForm.introduction"></el-input>
      </el-row>
      <el-row>
         <el-button @click="handleCloseEdit">取消</el-button>
         <el-button @click="editUserInfo">保存</el-button>
      </el-row>

    </el-dialog>
    <el-container style="height: 100%">

      <el-header style="height: 15%">
        <el-row style="height: 100%">
          <el-col :span="4">头像</el-col>
          <el-col :span="12">
            <el-row>{{ userinfo.name }}</el-row>

            <el-row>
              <el-button @click="handleOpenFans('关注')">
                关注 {{ userinfo.subscribeCount }}
              </el-button>
              <el-button @click="handleOpenFans('粉丝')">
                粉丝 {{ userinfo.fansCount }}
              </el-button>

            </el-row>
            <el-row>id: {{ userid }}</el-row>
            <el-row>{{ userinfo.introduction }}</el-row>
          </el-col>
          <el-col :span="4">
            <el-button @click="handleOpenEdit">
              编辑资料
            </el-button>
          </el-col>
        </el-row>
      </el-header>
      <el-main >
        <el-container>
          <el-header>
            <el-button @click="searchUserVideo('work')">作品</el-button>
            <el-button @click="searchUserVideo('like')">喜欢</el-button>
            <el-button @click="searchUserVideo('favorite')">收藏</el-button>
            <el-button @click="searchUserVideo('history')">观看历史</el-button>
            <el-button @click="searchUserVideo('later')">稍后再看</el-button>
          </el-header>
          <el-main>

          </el-main>
        </el-container>
      </el-main>
    </el-container>

  </div>

</template>

<style scoped lang="stylus">

</style>