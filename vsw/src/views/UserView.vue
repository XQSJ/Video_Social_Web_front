<script>
import axios from "axios";
import toLogin from '@/utils/toLogin'
import Follow from '@/utils/follow'
import Player from "xgplayer";

export default {
  data() {
    return {
      player: '',
      isSelf: false,
      loading: true,
      isFollower: 0,
      userid: '',
      userinfo: {
        name: '',
        profile: '',
        fansCount: 0,
        subscribeCount: 0,
        introduction: ''
      },
      aboutVideos: {},
      editForm: {
        profile: '',
        name: '',
        introduction: '',

      },
      option: '',
      videoList: {},
      userList: {},
      dialogVisible: {
        fans: false,
        editIntro: false,
        video: false,
        videoEdit :false
      },
      test: '',
      input_searchUser: ''
    }
  },
  beforeMount() {
    /* if(localStorage.getItem('userInfo')!==null){ //若为自己则重定向到self
       if(this.$route.query.id === JSON.parse(localStorage.getItem('userInfo')).userId){
         this.toUserView('self')
       }
     }*/
  },
  mounted() {

    if (localStorage.getItem('userInfo') !== null) { //若为自己则重定向到self
      if (this.$route.query.id === String(JSON.parse(localStorage.getItem('userInfo')).userId)) {
        this.toUserView('self')
      }
    }
    this.initInfo()
    //this.$refs.dialog.rendered = true;
    /*    this.player = new Player({
          id: 'video',
          url: '',
          plugins: [],
          poster: '',
          width: '100%',
          height: '100%',
          autoplay: false,
        })*/

  },
  beforeCreate() {
  },
  created() {
    /* if(localStorage.getItem('userInfo')===null){
       this.toLoginView();
     }*/
  },
  watch: {
    //监听路由更改时将id赋值
    '$route.query'(newId) {
      if (this.$route.name === 'user') {  //当路由为该界面时
        this.userid = newId.id //将传入的id赋值

        if (localStorage.getItem('userInfo') !== null) { //若为自己则重定向到self
          if (this.userid === JSON.parse(localStorage.getItem('userInfo')).userId) {
            this.toUserView('self')
          }
        }
        this.initInfo()//根据id查找其他值

      }

    },


  },
  methods: {
    handleCloseVideoEdit(){
      this.dialogVisible.videoEdit = false
    },
    handleOpenVideoEdit(){

    },
    showVideo(item, index) {
      this.dialogVisible.video = true


      this.player = new Player({
        id: 'video',
        url: '',
        plugins: [],
        poster: '',
        width: '100%',
        height: '100%',
        autoplay: false,
      })


    },
    closeVideo() {
      this.player.destroy()
      this.dialogVisible.video = false
    },
    toUser(userid) {
      this.handleCloseFans()
      this.toUserView(userid)
    },
    handleUnFollow(followid) {
      if (localStorage.getItem('userInfo') !== null) {
        let userid = JSON.parse(localStorage.getItem('userInfo')).userId
        axios.delete(`/follow/${userid}/${followid}`)
            .then(response => {
              if (response.data.code === 1) {
                this.$message(userid + "已取消关注" + followid)
                this.isFollower = 0
                this.userinfo.fansCount--;
              } else {
                this.$message.error('response.data.data');
                console.log(response.data.data)
              }

            })
      } else {
        this.login()
      }
    },
    handleFollow(followid) {
      if (localStorage.getItem('userInfo') !== null) {
        let userid = JSON.parse(localStorage.getItem('userInfo')).userId

        axios.post(`/follow/${userid}/${followid}`)
            .then(response => {
              if (response.data.code === 1) {
                this.$message(userid + "已关注" + followid)
                this.isFollower = response.data.data
                this.userinfo.fansCount++;
              } else {
                this.$message.error('response.data.data');
                console.log(response.data.data)
              }

            })
      } else {
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
    handleCloseVideos() {
      this.dialogVisible.video = false
    },
    handleCloseFans() {
      this.dialogVisible.fans = false

    },
    handleOpenFans(item) {
      let userid = this.userid
      if (item === '关注') {
        axios.get(`/follow/getsubs/${userid}`).then((response) => {
          this.userList = response.data.data;
        });
      } else {
        axios.get(`/follow/getfans/${userid}`).then((response) => {
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
    login() {
      toLogin.$emit('log')
    },
    editVideo(video) {
      console.log(video)
      this.dialogVisible.videoEdit = true
    },
    async isFollow(followid) {
      if (localStorage.getItem('userInfo') !== null) {
        let userid = JSON.parse(localStorage.getItem('userInfo')).userId
        await axios.get(`/follow/${userid}/${followid}`)
            .then((response) => {
              this.isFollower = response.data.data
              return response.data.data
            })
      }
      return false

    },

    async setinfo(userId) {
      await this.searchUserVideo('create', userId)
      //根据id查询user基本信息
      let user = await this.getUser(userId);
      //console.log(user)

      this.userinfo.name = user.userName
      this.userinfo.profile = user.avatar
      this.userinfo.introduction = user.userInfo
      this.userinfo.fansCount = user.fans
      this.userinfo.subscribeCount = user.subscriber

      if (this.isSelf === false) {
        this.isFollow(userId)
      }


    },
    searchUserVideo(option, userId) {

      this.aboutVideos = {}
      this.loading = true
      //     if (option !== this.option) { //当当前选项不为所选选项时才执行
      this.option = option
      console.log('执行搜索' + option)
      //执行搜索
      if (this.isSelf === true) {
        switch (option) {
          case 'create' : {
            axios.get(`/video/getSelf/${userId}`).then(async (response) => {
              if (response.data.code === 1) {
                let videos = response.data.data
                //console.log("aboutVideos",videos)

                for (let v of videos) {
                  //console.log(v)
                  v.coverUrl = await this.getCover(v.path)
                }
                this.aboutVideos = videos
                this.loading = false
              }
            })
          }
        }
      } else {
        switch (option) {
          case 'create' : {
            axios.get(`/video/getSelf/${userId}`).then(async (response) => {
              if (response.data.code === 1) {
                let videos = response.data.data
                //console.log("aboutVideos",videos)

                for (let v of videos) {
                  //console.log(v)
                  v.coverUrl = await this.getCover(v.path)
                }
                this.aboutVideos = videos
                this.loading = false
              }
            })
          }
        }
      }

      //   }
    },
    async getCover(videoId) {
      return await axios.get(`/video/getUrl/${videoId}`).then((response) => {
        if (response.data.code === 1) {
          //console.log('resoponse',response.data.data)
          return response.data.data.coverUrl;
        } else {
          return ''
        }
      })
    },
    clearSearchUser() {

    }
  }

}
</script>

<template>
  <div style="height: 100%">

    <!--    <el-dialog style="width: 100%;height: 100%" @opened="showVideo" :visible.sync="this.dialogVisible.video" :before-close="handleCloseVideos" :destroy-on-close="true">
          <div>
            eee
          </div>
          <div>
            {{test}}
          </div>-->
<!--
    <el-dialog style="width: 100%;height: 100%" @opened="showVideo" :visible.sync="this.dialogVisible.video" :before-close="handleCloseVideos" :destroy-on-close="true">
-->

    <div v-show="this.dialogVisible.video" >
      <el-button @click="closeVideo">关闭</el-button>
      <div id="video" class="video-container" style="width: 100%;height: 500px" v-show="this.dialogVisible.video">
        <div>
        </div>
      </div>
       <el-button @click="editVideo(item)" v-if="isSelf">编辑</el-button>
    </div>

<!--    </el-dialog>-->
    <el-dialog :visible.sync="this.dialogVisible.videoEdit" :before-close="handleCloseVideoEdit">

    </el-dialog>
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
      <el-main style="height: 100%">
        <el-container class="about-video">
          <el-header class="about-video-header">
            <el-button @click="searchUserVideo('create',userid)">作品</el-button>
            <el-button @click="searchUserVideo('like',userid)">喜欢</el-button>
            <el-button @click="searchUserVideo('favorite',userid)">收藏</el-button>
            <el-button @click="searchUserVideo('history',userid)">观看历史</el-button>
            <el-button @click="searchUserVideo('later',userid)">稍后再看</el-button>
          </el-header>
          <el-main>
            <div class="video-grid" v-loading="loading">
              <div v-for="(item, index) in aboutVideos" :key="item.videoId" class="video-item">
                <el-button style="height: 100%;width: 100%" @click="showVideo(item,index)">
                  <img v-if="item.coverUrl" :src="item.coverUrl" alt="视频封面" class="video-cover"/>
                  <div v-else class="placeholder-cover">封面加载中...</div>
                  <h3>{{ item.title }}</h3>
                  点赞数 {{ item.likeCount }}
                  <!--                <el-button @click="editVideo(item)" v-if="isSelf">编辑</el-button>-->
                </el-button>

              </div>
            </div>
          </el-main>
        </el-container>
      </el-main>
    </el-container>

  </div>

</template>

<style scoped lang="stylus">
.about-video {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
  background-color: #f9f9f9; // Light background for better contrast
}

.about-video-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff; // White background for header
  height: 60px; // Increased height for better spacing
  display: flex;
  align-items: center;
  padding: 0 20px; // Increased padding for better spacing
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); // Slightly darker shadow for more depth
}

.video-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 20px; // Increased gap for better spacing
  padding: 20px; // Increased padding for breathing space
  overflow-y: auto;
  max-height: calc(100vh - 120px); // Adjusted maximum height
  background-color: #ffffff; // Set a white background for video grid
  border-radius: 8px; // Rounded corners for the grid
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); // Shadow for the grid
}

.video-item {
  width: calc(25% - 15px); // Four-column layout with adjusted margin
  background-color: #fff;
  border: 1px solid #e0e0e0; // Softer border color
  border-radius: 8px; // Increased roundness
  overflow: hidden;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s; // Smooth transition for hover effects
  cursor: pointer; // Pointer cursor for better UX
}

.video-item:hover {
  transform: scale(1.05); // Slightly increase size on hover
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); // Shadow effect on hover
}

.video-cover {
  width: 100%;
  height: 180px; // Increased height for better visibility
  object-fit: cover;
  border-bottom: 3px solid #007bff; // Add a colored bottom border for effect
}

.placeholder-cover {
  width: 100%;
  height: 180px;
  background-color: #e0e0e0; // Softer placeholder color
  display: flex;
  justify-content: center;
  align-items: center;
  color: #999;
  font-size: 18px; // Larger font size for better visibility
}

.video-title {
  font-size: 16px; // Increased title size
  margin: 10px;
  font-weight: bold; // Bold title for emphasis
  color: #333; // Darker text color for contrast
}

.el-button {
  background-color: #007bff; // Primary button color
  color: white; // Button text color
  border: none; // Remove border for a cleaner look
  border-radius: 5px; // Rounded button corners
  padding: 8px 12px; // Button padding
  transition: background-color 0.3s; // Smooth transition for hover effect
}

.el-button:hover {
  background-color: #0056b3; // Darker shade on hover
}
</style>
