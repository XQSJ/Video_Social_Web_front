<script>
import axios from "axios";
import toLogin from '@/utils/toLogin'
export default {
  data() {
    return {
      isSelf:false,
      isFollower:0,
      userid: '',
      userinfo: {
        name: '',
        profile: '',
        fansCount: 0,
        subscribeCount: 0,
        introduction: ''
      },
      editForm: {
        profile: '',
        name: '',
        introduction: ''
      },
      option: '',
      videoList: {},
      userList: {

      },
      dialogVisible: {
        fans: false,
        editIntro: false
      },

      input_searchUser: ''
    }
  },
  beforeMount(){
    if(localStorage.getItem('userInfo')!==null){ //若为自己则重定向到self
      if(this.$route.query.id === JSON.parse(localStorage.getItem('userInfo')).userId){
        this.toUserView('self')
      }
    }
  },
  mounted() {
    if(localStorage.getItem('userInfo')!==null){ //若为自己则重定向到self
      if(this.$route.query.id === JSON.parse(localStorage.getItem('userInfo')).userId){
        this.toUserView('self')
      }
    }
    this.initInfo()
  },
  created() {
    /*if (window.name === '') {
      console.log('1页面首次被加载')
    } else {
      console.log('1页面被刷新')
    }*/
  },
  watch: {
    //监听路由更改时将id赋值
    '$route.query'(newId) {
      if (this.$route.name === 'user') {  //当路由为该界面时
        this.userid = newId.id //将传入的id赋值

        if(localStorage.getItem('userInfo')!==null){ //若为自己则重定向到self
          if(this.userid === JSON.parse(localStorage.getItem('userInfo')).userId){
            this.toUserView('self')
          }
        }
        this.initInfo()//根据id查找其他值
      }

    }
  },
  methods: {
    toUser(userid){
      this.handleCloseFans()
      this.toUserView(userid)
    },
    handleUnFollow(followid){
      let userid = JSON.parse(localStorage.getItem('userInfo')).userId
      axios.delete(`/follow/${userid}/${followid}`)
          .then(response=>{
            if(response.data.code===1){
              this.$message(userid+"已取消关注"+followid)
              this.isFollower = 0
              this.userinfo.fansCount--;
            }else{
              this.$message.error('response.data.data');
              console.log(response.data.data)
            }

          })
    },
    handleFollow(followid){
      if(localStorage.getItem('userInfo')!==null){
        let userid = JSON.parse(localStorage.getItem('userInfo')).userId

        axios.post(`/follow/${userid}/${followid}`)
            .then(response=>{
              if(response.data.code===1){
                this.$message(userid+"已关注"+followid)
                this.isFollower = response.data.data
                this.userinfo.fansCount++;
              }else{
                this.$message.error('response.data.data');
                console.log(response.data.data)
              }

            })
      }else{
        //console.log('未登录')
        this.login();
      }



    },
    initInfo() {
      if (this.$route.query.id === 'self') {

        //console.log(localStorage.getItem('userInfo'))
        if (localStorage.getItem('userInfo') !== null) {
          let user = JSON.parse(localStorage.getItem('userInfo'))

          this.userid = user.userId
          this.isSelf = true
          this.setinfo(this.userid)
    /*      this.userinfo.name = user.userName
          this.userinfo.profile = user.avatar
          this.userinfo.introduction = user.userInfo
          this.userinfo.fansCount = user.fans
          this.userinfo.subscribeCount = user.subscriber*/

        }

      } else {
        this.isSelf = false
        //将id赋值
        this.userid = this.$route.query.id
        //console.log('其他用户'+this.userid)
        //根据id查找其他值
        this.setinfo(this.userid)
      }
    },
    handleCloseFans() {
      this.dialogVisible.fans = false

    },
    handleOpenFans(item) {
      let userid = this.userid
      if(item==='关注'){
        axios.get(`/follow/getsubs/${userid}`).then((response)=>{
           this.userList = response.data.data;
        });
      }else{
        axios.get(`/follow/getfans/${userid}`).then((response)=>{
          this.userList = response.data.data;
        });
      }

      this.dialogVisible.fans = true
    },
    handleCloseEdit() {
      this.dialogVisible.editIntro = false
    },
    handleOpenEdit() {
      this.dialogVisible.editIntro = true
      this.editForm.name = this.userinfo.name
      this.editForm.introduction = this.userinfo.introduction
      this.editForm.profile = this.userinfo.profile
    },
    async editUserInfo() {
      let userInfo = {
        "userId": this.userid,
        "userName": this.editForm.name,
        "avatar": this.editForm.profile,
        "userInfo": this.editForm.introduction
      }

      //调用接口修改信息 ？？？
      await axios.put('/users/update', userInfo).then((response) => {
        //console.log(response.data)
        let user = JSON.parse(localStorage.getItem('userInfo'))
        user.userName = userInfo.userName
        user.userInfo = userInfo.userInfo
        user.avatar = userInfo.avatar

        localStorage.setItem('userInfo', JSON.stringify(user))
        this.userinfo.name = this.editForm.name
        this.userinfo.introduction = this.editForm.introduction
        this.userinfo.profile = this.editForm.profile
        this.handleCloseEdit()
      }).catch(error => {

      })
      //
      /*      if(1){//修改成功后触发下列内容
              this.userinfo.name=this.editForm.name
              this.userinfo.introduction=this.editForm.introduction
              this.userinfo.profile=this.editForm.profile
              this.handleCloseEdit()
            }else{ //修改不成功？？？
            }*/

    },
    login(){
      toLogin.$emit('log')
    },
    async isFollow(followid){
      if(localStorage.getItem('userInfo')!==null){
        let userid = JSON.parse(localStorage.getItem('userInfo')).userId
        await axios.get(`/follow/${userid}/${followid}`)
            .then((response)=>{
              this.isFollower=response.data.data
            })
      }
    },
    async setinfo(userId) {
      //根据id查询user基本信息
      await axios
          .get(`/users/${userId}`)
          .then((response)=>{
            //user信息赋值
            let user = response.data.data
            this.userinfo.name = user.userName
            this.userinfo.profile = user.avatar
            this.userinfo.introduction = user.userInfo
            this.userinfo.fansCount = user.fans
            this.userinfo.subscribeCount = user.subscriber
            if(this.isSelf===false){
              this.isFollow(userId)
            }
          })


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
      <el-button @click="handleOpenFans('关注')">关注</el-button>
      <el-button @click="handleOpenFans('粉丝')">粉丝</el-button>
      <el-input placeholder="搜索用户名字或id" v-model="input_searchUser" clearable @clear="clearSearchUser">
      </el-input>
      <div v-for="(user, index) in userList" @click="toUser(user.userId)">

        id：{{ user.userId }}
        名称：{{ user.userName }}<br>
        {{ user.userInfo }}
      </div>
    </el-dialog>
    <el-dialog :close-on-click-modal="false" :visible="this.dialogVisible.editIntro" :before-close="handleCloseEdit"
               :destroy-on-close=true>
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
        <el-input placeholder="介绍一下你自己" v-model="editForm.introduction"></el-input>
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
            <el-button @click="handleOpenEdit" v-if="this.isSelf">
              编辑资料
            </el-button>
            <div v-if="!this.isSelf">
              <el-button @click="handleFollow(userid)" v-if="isFollower===0">
                关注
              </el-button>
              <el-button @click="handleUnFollow(userid)" v-if="isFollower===1">
                已关注
              </el-button>
              <el-button @click="handleUnFollow(userid)" v-if="isFollower===2">
                相互关注
              </el-button>
            </div>

          </el-col>
        </el-row>
      </el-header>
      <el-main>
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