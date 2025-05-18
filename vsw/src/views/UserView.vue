<script>
import axios from "axios";
import toLogin from '@/utils/toLogin'
import Follow from '@/utils/follow'
import Player from "xgplayer";
import handleMainMenu from "@/utils/handleMainMenu";

import UserVideoPlayerDialog from "@/views/Dialog/UserVideoPlayerDialog.vue";

export default {
  components: {UserVideoPlayerDialog},
  data() {
    return {
      source: null,
      imageUpList: [],
      player: '',
      isSelf: false,
      searchVideoLoading: true,
      upAvatarLoading: false,
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
        videoEdit: false
      },
      imageUploader: null,
      input_searchUser: '',
      avatarInfo: {}
    }
  },
  beforeMount() {

    /*    if (localStorage.getItem('userInfo') !== null) { //若为自己则重定向到self

          if (this.$route.query.id === JSON.parse(localStorage.getItem('userInfo')).userId) {

            this.toUserView('self')
          }
        }*/
  },
  mounted() {
    if (localStorage.getItem('userInfo') !== null) {
      let id = JSON.parse(localStorage.getItem('userInfo')).userId;
      if(this.$route.query.id==id){
        this.toUser('self')
      }
    }else{
      if(this.$route.query.id==='self'){
        console.log('未登录')
      }
    }

    this.initInfo()

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
/*        if (localStorage.getItem('userInfo') !== null) {
          let id = JSON.parse(localStorage.getItem('userInfo')).userId;
          if(this.$route.query.id==id){
            this.toUser('self')
          }
        }*/
        this.initInfo()//根据id查找其他值

      }

    },


  },
  methods: {
    uploadImage(file) {
      console.log("上传文件")


    },
    initAcsClintImage() {
      let _this = this;
      let imageUploader = new AliyunUpload.Vod({
        userId: 1229526364672621,
        region: "cn-shanghai",
        // 分片大小默认1 MB，不能小于100 KB（100*1024）
        partSize: 1048576,
        // 并行上传分片个数，默认5
        parallel: 5,
        // 网络原因失败时，重新上传次数，默认为3
        retryCount: 3,
        // 网络原因失败时，重新上传间隔时间，默认为2秒
        retryDuration: 2,
        // 添加文件成功
        addFileSuccess: function (uploadInfo) {
          console.log("addFileSuccess: ")
          console.log(uploadInfo)

        },
        // 开始上传
        'onUploadstarted': function (uploadInfo) {
          console.log('startupimage:')
          console.log(uploadInfo)
          if (!uploadInfo.imageId) {

            let createUrl = "/image/create"
            let imageInfo = {
              "title": '',
              "type": 'cover'
            }

            axios.post(createUrl, imageInfo).then((response) => {
              console.log(response)
              if (response.data.code === 1) {
                let data = response.data.data
                console.log("uploadInfo", uploadInfo);
                console.log(data)
                imageUploader.setUploadAuthAndAddress(uploadInfo, data.uploadAuth, data.uploadAddress, data.imageId);
                _this.avatarInfo = null;
                _this.avatarInfo = data;
              }
            })
          } else {

          }


        },
        // 文件上传成功
        'onUploadSucceed': function (uploadInfo) {
          console.log(uploadInfo.file.name + '上传成功')

          _this.editForm.profile = _this.avatarInfo.imageURL;

        },
        // 文件上传失败
        'onUploadFailed': function (uploadInfo, code, message) {
          console.log(uploadInfo.file.name + '上传失败')
        },
        // 文件上传进度，单位：字节
        'onUploadProgress': function (uploadInfo, totalSize, loadedPercent) {
          console.log("onUploadProgress:file:" + uploadInfo.file.name + ", fileSize:" + totalSize + ", percent:" + Math.ceil(loadedPercent * 100) + "%");
        },
        // 上传凭证或STS token超时
        'onUploadTokenExpired': function (uploadInfo) {
          console.log("上传凭证或STS token超时")
          /* let refreshUrl = `/video/refresh/${uploadInfo.videoId}`
           axios.get(refreshUrl).then((response) => {
             if (response.data.code === 1) {
               let data = response.data.data
               let uploadAuth = data.uploadAuth
               let uploadAddress = data.uploadAddress
               let videoId = data.videoId
               uploader.resumeUploadWithAuth(uploadAuth)
             }
           })*/
        },
        // 全部文件上传结束
        'onUploadEnd': function (uploadInfo) {
          console.log("onUploadEnd: uploaded all the files")
          _this.upAvatarLoading = false
          // _this.editForm.profile = uploadInfo.
          // _this.toUserView('self')
        }

      })
      return imageUploader
    },
    test(a) {
      console.log(a)
    },
    handleChangeImage(file, fileList) {
      this.upAvatarLoading = true
      this.imageUpList = [];
      this.imageUpList = fileList;
    },
    reUploadImage() {
      //之前的文件删除
      //this.imageUpList=[];
      //初始化上传器
      this.imageUploader = this.initAcsClintImage()
      this.imageUploader.addFile(this.imageUpList[0].raw, null, null, null)
      this.imageUploader.startUpload()
      // this.imageUploader.startUpload()
    },
    handleCloseVideoEdit() {
      this.dialogVisible.videoEdit = false
    },
    handleOpenVideoEdit() {

    },
    showVideo(item) {

      this.$refs.videoDialog.showDialog(item.videoId)

      //console.log("item:", item)


    },
    closeVideo() {
      /*    this.player.destroy()
          this.dialogVisible.video = false*/
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
                //console.log(response.data.data)
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
                //console.log(response.data.data)
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

      if (this.isSelf === false){
        handleMainMenu.$emit('cancel')
        if(JSON.parse(localStorage.getItem('userInfo'))!==null){
          let id = JSON.parse(localStorage.getItem('userInfo')).userId;
          let visit={
            'visiterId': id,
            'showerId': this.userid
          }
          axios.post('/history/visit',visit)
        }

      }
      else
        handleMainMenu.$emit('user')

    },
    handleCloseVideos() {
      // this.dialogVisible.video = false
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
      this.imageUpList = []
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
        "avatar": this.avatarInfo.imageId,
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
      //console.log(video)
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
      if (user !== null) {
        if (user.avatar !== null) {
          this.avatarInfo.imageId = user.avatar

          await axios.get(`/image/getUrl/${user.avatar}`).then((response) => {
            user.avatar = response.data.data
          })
        }
        //console.log(user)

        this.userinfo.name = user.userName
        this.userinfo.profile = user.avatar
        this.userinfo.introduction = user.userInfo
        this.userinfo.fansCount = user.fans
        this.userinfo.subscribeCount = user.subscriber
      } else {

      }


      if (this.isSelf === false) {
        this.isFollow(userId)
      }


    },
    handleCancel() {
      this.source.cancel('取消请求')
      this.searchVideoLoading = false

    },
    searchUserVideo(option, userId) {
      let _this = this;
      if (this.source !== null) {
        this.handleCancel()
      }
      this.aboutVideos = {}
      this.searchVideoLoading = true
      this.option = option
      //console.log('执行搜索' + option)
      const source = axios.CancelToken.source()
      this.source = source
      let url;
      let method = '';
      //执行搜索
      switch (option) {
        case 'create': {
          method = 'getSelf'
          break;
        }
        case 'like': {
          method = 'getLikeVideos'
          break;
        }
        case 'history':{
          method = 'getHistoryVideos'
          break;
        }
        default: {

        }
      }
      if (method !== '') {
        url = '/video/' + method + '/' + userId

        axios.get(url, {
          cancelToken: source.token
        }).then(async (response) => {
          if (response.data.code === 1) {
            let videos = response.data.data
            let delay
            if (videos.length === 0)
              delay = 500
            else
              delay = 0
            setTimeout(() => {
              this.aboutVideos = videos
              this.searchVideoLoading = false
            }, delay);


          }
          this.source = null;
        }).catch(error => {

        })
      } else {
        this.searchVideoLoading = false
      }


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
<!--

<template>
  <div style="height: 100%">

    &lt;!&ndash;    <el-dialog style="width: 100%;height: 100%" @opened="showVideo" :visible.sync="this.dialogVisible.video" :before-close="handleCloseVideos" :destroy-on-close="true">
          <div>
            eee
          </div>
          <div>
            {{test}}
          </div>&ndash;&gt;
&lt;!&ndash;
    <el-dialog style="width: 100%;height: 100%" @opened="showVideo" :visible.sync="this.dialogVisible.video" :before-close="handleCloseVideos" :destroy-on-close="true">
&ndash;&gt;

    <div v-show="this.dialogVisible.video" >
      <el-button @click="closeVideo">关闭</el-button>
      <div id="video" class="video-container" style="width: 100%;height: 500px" v-show="this.dialogVisible.video">
        <div>
        </div>
      </div>
       <el-button @click="editVideo(item)" v-if="isSelf">编辑</el-button>
    </div>

&lt;!&ndash;    </el-dialog>&ndash;&gt;
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
                  &lt;!&ndash;                <el-button @click="editVideo(item)" v-if="isSelf">编辑</el-button>&ndash;&gt;
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
-->

<template>
  <!-- 页面主容器 -->
  <div class="user-view-page">

    <!-- 用户信息头部区域 -->
    <el-card class="user-header-card" shadow="never">
      <el-row :gutter="20" type="flex" align="middle" class="user-info-row">
        <!-- 头像列 -->
        <el-col :xs="24" :sm="4" :md="3" class="avatar-col">
          <!-- 使用 el-avatar 显示头像 -->
          <el-avatar :size="80"
                     :src="userinfo.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"/>
          <!-- 原始模板: <el-col :span="4">头像</el-col> -->
        </el-col>

        <!-- 用户信息主列 -->
        <el-col :xs="24" :sm="14" :md="15" class="info-col">
          <!-- 用户名 -->
          <h2 class="user-name">{{ userinfo.name || '加载中...' }}</h2>
          <!-- 用户ID -->
          <p class="user-id">ID: {{ userid || 'N/A' }}</p>
          <!-- 用户简介 -->
          <p class="user-intro" :title="userinfo.introduction">{{
              userinfo.introduction || '这位用户很神秘，什么也没留下...'
            }}</p>
          <!-- 关注/粉丝统计 -->
          <div class="user-stats">
            <el-button type="text" @click="handleOpenFans('关注')">
              <strong>{{ userinfo.subscribeCount }}</strong> 关注
            </el-button>
            <el-divider direction="vertical"></el-divider>
            <el-button type="text" @click="handleOpenFans('粉丝')">
              <strong>{{ userinfo.fansCount }}</strong> 粉丝
            </el-button>
          </div>
          <!-- 原始模板对应内容:
          <el-row>{{ userinfo.name }}</el-row>
          <el-row> <el-button @click="handleOpenFans('关注')">...</el-button> ... </el-row>
          <el-row>id: {{ userid }}</el-row>
          <el-row>{{ userinfo.introduction }}</el-row>
          -->
        </el-col>
        <!-- 操作按钮列 -->
        <el-col :xs="24" :sm="6" :md="6" class="action-col">
          <!-- 如果是用户本人，显示编辑资料按钮 -->
          <el-button v-if="isSelf" type="primary" plain round icon="el-icon-edit" @click="handleOpenEdit">编辑资料
          </el-button>
          <!-- 如果不是用户本人，显示关注/私信按钮 -->
          <div v-else>
            <!-- 根据 isFollower 状态显示不同关注按钮 -->
            <el-button v-if="isFollower === 0" type="primary" round icon="el-icon-plus" @click="handleFollow(userid)">
              关注
            </el-button>
            <el-button v-if="isFollower === 1" type="info" plain round icon="el-icon-check"
                       @click="handleUnFollow(userid)">已关注
            </el-button>
            <el-button v-if="isFollower === 2" type="success" plain round icon="el-icon-refresh"
                       @click="handleUnFollow(userid)">互相关注
            </el-button>
            <!-- 可以添加私信按钮 -->
            <!-- <el-button type="info" round icon="el-icon-message" style="margin-left: 10px;">私信</el-button> -->
          </div>
          <!-- 原始模板对应内容:
          <el-col :span="4"> <el-button @click="handleOpenEdit" v-if="this.isSelf">...</el-button> <div v-if="!this.isSelf">...</div> </el-col>
          -->
        </el-col>
      </el-row>
    </el-card>
    <!--    <el-button @click="test(isSelf)">test</el-button>-->
    <!-- 视频内容区域 -->
    <el-card class="content-card" shadow="never">
      <!-- 视频分类 Tab 头 -->
      <div class="tabs-header">
        <!-- 点击按钮调用 searchUserVideo 方法，传入分类和用户ID -->
        <el-button :type="option === 'create' ? 'primary' : 'default'" plain @click="searchUserVideo('create', userid)">
          作品
        </el-button>
        <el-button :type="option === 'like' ? 'primary' : 'default'" plain @click="searchUserVideo('like', userid)">
          喜欢
        </el-button>
        <el-button :type="option === 'favorite' ? 'primary' : 'default'" plain
                   @click="searchUserVideo('favorite', userid)">收藏
        </el-button>
        <el-button v-show="isSelf" :type="option === 'history' ? 'primary' : 'default'" plain
                   @click="searchUserVideo('history', userid)">观看历史
        </el-button>
        <el-button v-show="isSelf" :type="option === 'later' ? 'primary' : 'default'" plain
                   @click="searchUserVideo('later', userid)">稍后再看
        </el-button>
        <!-- 原始模板对应内容:
        <el-header class="about-video-header"> <el-button @click="searchUserVideo('create',userid)">作品</el-button> ... </el-header>
        -->
      </div>

      <!-- 视频网格显示区域 -->
      <div class="video-grid-wrapper" v-loading="searchVideoLoading" element-loading-text="加载视频列表中...">
        <!-- 如果没在加载且视频列表为空，显示提示 -->
        <el-empty
            v-if="!searchVideoLoading && (!aboutVideos || (Array.isArray(aboutVideos) && aboutVideos.length === 0) || (typeof aboutVideos === 'object' && Object.keys(aboutVideos).length === 0))"
            :description="`${option === 'create' ? '还没有发布过作品哦' : '列表为空'}`">
        </el-empty>
        <!-- 否则，显示视频网格 -->
        <div v-else class="video-grid">
          <!-- 循环渲染视频项 -->
          <!-- 注意：原始脚本 aboutVideos 初始化为 {}，v-for 通常需要数组。这里保持模板不变，依赖 script 中获取数据后将其变为数组 -->
          <div v-for="(item, index) in aboutVideos" :key="item.videoId || item.id || index" class="video-item">
            <!-- 将整个卡片做成按钮样式或可点击区域 -->
            <!-- 原始模板是 <el-button> 包裹，可能导致样式问题，改为 div 监听点击 -->
            <div class="video-item-clickable" @click="showVideo(item, index)">
              <div class="cover-container">
                <!-- 显示封面图 -->
                <img v-if="item.coverUrl" :src="item.coverUrl" alt="视频封面" class="video-cover"/>
                <!-- 封面加载失败或不存在时显示占位符 -->
                <div v-else class="placeholder-cover">
                  <i class="el-icon-picture-outline"></i>
                  <span>封面加载中</span>
                </div>
                <!-- 可选：视频时长 -->
                <!-- <span class="video-duration">00:00</span> -->
              </div>
              <div class="video-info">
                <!-- 视频标题 -->
                <h3 class="video-title" :title="item.title">{{ item.title || '无标题视频' }}</h3>
                <!-- 视频元数据，如点赞数 -->
                <div class="video-meta">
                  <span><i class="el-icon-thumb"></i> {{ item.likeCount || 0 }}</span>
                  <!-- 可以添加播放量等 -->
                  <!-- <span><i class="el-icon-view"></i> {{ item.playCount || 0 }}</span> -->
                </div>
              </div>
            </div>
            <!-- 编辑按钮 (仅自己可见，且在作品tab下) -->
            <el-button
                v-if="isSelf && option === 'create'"
                class="edit-video-btn"
                type="primary"
                icon="el-icon-edit"
                size="mini"
                circle
                @click.stop="editVideo(item)"
                title="编辑视频信息">
            </el-button>
            <!-- 原始模板对应内容:
            <div v-for="(item, index) in aboutVideos"> <el-button @click="showVideo(item,index)"> <img/> <div>...</div> </el-button> </div>
            -->
          </div>
        </div>
      </div>
    </el-card>

    <!-- 弹窗区域 -->

    <!-- 视频播放弹窗 -->
    <!-- 使用 el-dialog 实现视频播放弹窗 -->


    <!--
        <el-dialog :visible.sync="dialogVisible.video" ref="dialog" width="70%"
                   top="5vh">

          &lt;!&ndash; 设置标题 &ndash;&gt;
          <span slot="title" class="dialog-title">{{
              /* currentVideo ? currentVideo.title : */
              '视频播放'
            }}</span>
          &lt;!&ndash; 播放器容器 &ndash;&gt;
          <div :ref="'video'" class="video-container" style="width: 100%;height: 500px" v-show="this.dialogVisible.video"/>
          &lt;!&ndash; 可以添加加载提示 &ndash;&gt;
          <div v-if="!player" class="player-loading-placeholder">
            <i class="el-icon-loading"></i> 视频加载中...
          </div>
        </el-dialog>
    -->
<!--    <user-video-dialog ref="videoDialog"></user-video-dialog>-->
    <user-video-player-dialog ref="videoDialog"></user-video-player-dialog>

    <!--
        <el-dialog
            ref="dialog"
            :visible.sync="dialogVisible.video"
            :before-close="handleCloseVideos"
            custom-class="video-player-dialog"
            width="70%"
            top="5vh"
            :destroy-on-close="true"
            append-to-body>
          &lt;!&ndash; 设置标题 &ndash;&gt;
          <span slot="title" class="dialog-title">{{ /* currentVideo ? currentVideo.title : */ '视频播放' }}</span>
          &lt;!&ndash; 播放器容器 &ndash;&gt;
          &lt;!&ndash; ** ID 必须与 showVideo 方法中 Player 初始化的 id 匹配！** &ndash;&gt;
          <div :ref="'video'" class="video-container">
            &lt;!&ndash; 播放器将挂载到这里 &ndash;&gt;
            &lt;!&ndash; 可以添加加载提示 &ndash;&gt;
    &lt;!&ndash;        <div v-if="!player" class="player-loading-placeholder">
              <i class="el-icon-loading"></i> 视频加载中...
            </div>&ndash;&gt;
          </div>
          &lt;!&ndash; 原始模板对应内容: <div v-show="this.dialogVisible.video"> <el-button @click="closeVideo">关闭</el-button> <div id="video">...</div> ... </div> &ndash;&gt;
        </el-dialog>
    -->

    <!-- 编辑视频信息弹窗 -->
    <el-dialog title="编辑视频信息" :visible.sync="dialogVisible.videoEdit" :before-close="handleCloseVideoEdit"
               width="50%" append-to-body>
      <!-- 编辑表单 -->
      <p>在这里放置编辑视频信息的表单元素...</p>
      <p>例如：标题、简介、封面等</p>
      <!-- 原始模板只有一个空的 el-dialog -->
      <span slot="footer" class="dialog-footer">
         <el-button @click="handleCloseVideoEdit">取 消</el-button>
         <el-button type="primary" @click="submitVideoEdit">确 定</el-button> <!-- 假设有 submitVideoEdit 方法 -->
       </span>
    </el-dialog>

    <!-- 粉丝/关注列表弹窗 -->
    <el-dialog :title="'用户列表'" :visible.sync="dialogVisible.fans" :before-close="handleCloseFans" width="450px"
               append-to-body>
      <!-- 弹窗顶部操作 -->
      <div class="fans-dialog-header">
        <el-button-group style="margin-bottom: 15px;">
          <!-- 点击按钮调用 handleOpenFans 刷新列表 -->
          <el-button size="small" @click="handleOpenFans('关注')">关注列表</el-button>
          <el-button size="small" @click="handleOpenFans('粉丝')">粉丝列表</el-button>
        </el-button-group>
        <!-- 搜索框 -->
        <el-input
            placeholder="搜索用户昵称或ID"
            prefix-icon="el-icon-search"
            v-model="input_searchUser"
            clearable
            @clear="clearSearchUser"
            size="small">
        </el-input>
      </div>
      <!-- 用户列表容器 -->
      <div class="user-list-container" v-loading="searchVideoLoading.fansList"> <!-- 假设有 loading.fansList 状态 -->
        <el-empty
            v-if="!searchVideoLoading.fansList && (!userList || (Array.isArray(userList) && userList.length === 0) || (typeof userList === 'object' && Object.keys(userList).length === 0))"
            description="列表为空"></el-empty>
        <!-- 过滤显示用户列表 -->
        <!-- 注意：原始脚本 userList 初始化为 {}，需要确保获取数据后变成数组才能 filter -->
        <div v-else class="user-list">
          <div
              v-for="(user) in (Array.isArray(userList) ? userList.filter(u => String(u.userName || '').toLowerCase().includes(input_searchUser.toLowerCase()) || String(u.userId || '').includes(input_searchUser)) : [])"
              :key="user.userId"
              class="user-list-item"
              @click="toUser(user.userId)">
            <el-avatar :size="40"
                       :src="user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
            <div class="user-list-info">
              <span class="user-list-name">{{ user.userName }}</span>
              <!-- 原始模板显示 userInfo，这里改为显示 ID 可能更常用 -->
              <span class="user-list-id">ID: {{ user.userId }}</span>
              <!-- <span class="user-list-intro">{{ user.userInfo }}</span> -->

            </div>
            <!-- 可以添加关注/取消关注按钮 -->
          </div>
        </div>
      </div>
      <!-- 原始模板对应内容:
      <el-dialog :visible="this.dialogVisible.fans"> <el-button @click="handleOpenFans('关注')">关注</el-button> ... <el-input> ... <div v-for>...</div> </el-dialog>
      -->
    </el-dialog>

    <!-- 编辑个人资料弹窗 -->
    <el-dialog title="编辑个人资料" :visible.sync="dialogVisible.editIntro" :before-close="handleCloseEdit"
               width="500px" :close-on-click-modal="false" append-to-body v-loading="upAvatarLoading">

      <!-- 使用 el-form 组织编辑表单 -->
      <el-form :model="editForm" label-width="80px" class="edit-profile-form">
        <el-form-item label="头像">
          <!-- 头像显示与上传触发 -->
          <el-avatar :size="60"
                     :src="editForm.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
          <!-- 实际头像上传需要 <el-upload> 组件 -->
          <el-upload
              class="video-uploader"
              :limit="1"
              :multiple="false"
              :file-list="imageUpList"
              :on-change="handleChangeImage"
              :http-request=" reUploadImage"
              :show-file-list="false">
            <el-button size="small" style="margin-left: 10px;">更换头像</el-button>
          </el-upload>

          <!-- <el-upload action="..." :show-file-list="false" ... style="display:none" ref="avatarUploader"></el-upload> -->
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="editForm.name" placeholder="请输入昵称" maxlength="20" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="简介">
          <el-input type="textarea" v-model="editForm.introduction" placeholder="介绍一下你自己吧" rows="3"
                    maxlength="100" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <!-- 原始模板是 <el-row> 堆叠 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="handleCloseEdit">取 消</el-button>
        <el-button type="primary" @click="editUserInfo" :loading="searchVideoLoading.editing">保 存</el-button>
        <!-- 假设有 loading.editing 状态 -->
        </span>


    </el-dialog>

  </div>
</template>

<style scoped lang="stylus">
// --- 页面整体与卡片样式 ---
.user-view-page {
  height: 100%; // 尝试撑满父容器高度
  padding: 15px; // 页面内边距
  background-color: #f5f7fa; // 页面背景色
  box-sizing: border-box; // padding 不会撑大元素
}

.user-header-card, .content-card {
  margin-bottom: 20px; // 卡片间距
  border: none; // 去掉卡片边框
  background-color: #fff; // 卡片背景色
}

// --- 用户信息头部 ---
.user-info-row {
  // Flex 布局默认行为，无需额外样式
}

.avatar-col {
  text-align: center; // 头像居中
  // 小屏幕头像放顶部
  @media (max-width: 767px) {
    margin-bottom: 15px;
  }
}

.info-col {
  // 包含主要信息
}

.user-name {
  font-size: 22px; // 名字大一点
  font-weight: 600;
  margin: 0 0 5px 0; // 底部间距
  color: #303133;
  line-height: 1.3;
}

.user-id {
  font-size: 13px; // ID 小一点
  color: #909399;
  margin-bottom: 8px;
}

.user-intro {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.6;
  // 多行文本省略
  display: -webkit-box;
  -webkit-line-clamp: 2; // 最多显示 2 行
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em; // 保证至少两行的高度，防止抖动
}

.user-stats {
  .el-button--text { // 调整关注/粉丝按钮样式
    color: #606266;
    font-size: 14px;
    padding: 0 5px;

    strong { // 数字加粗加大
      font-size: 17px;
      font-weight: 600;
      color: #303133;
      margin-right: 3px;
    }
  }

  .el-divider--vertical {
    margin: 0 12px; // 分隔线左右间距
  }
}

.action-col {
  text-align: right; // 操作按钮默认右对齐
  // 小屏幕按钮居中或左对齐
  @media (max-width: 767px) {
    text-align: center;
    margin-top: 15px;
  }

  .el-button { // 按钮间距
    margin-left: 10px;

    &:first-child {
      margin-left: 0;
    }
  }

  // 调整按钮大小和内边距

  .el-button--round {
    padding: 8px 18px;
  }
}

// --- 内容区域 Tabs 和视频网格 ---
.tabs-header {
  padding-bottom: 15px; // 底部留白
  border-bottom: 1px solid #e4e7ed; // 分割线
  margin-bottom: 20px; // 与下方网格间距

  .el-button {
    margin-right: 8px; // 按钮间距
    // 调整按钮样式，plain 效果更好
    // padding: 8px 15px; // 调整内边距
  }

  .el-button--primary.is-plain { // 主题色 plain 按钮样式调整
    color: #409EFF;
    background: #ecf5ff;
    border-color: #b3d8ff;
  }

  .el-button--primary.is-plain:hover {
    background: #409EFF;
    border-color: #409EFF;
    color: #FFF;
  }
}

.video-grid-wrapper {
  min-height: 200px; // 防止加载时高度坍塌
  position: relative; // 用于 v-loading 定位
}

.video-grid {
  display: grid; // 使用 Grid 布局
  // 自动填充列，每列最小 200px，最大 1fr (均分剩余空间)
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 18px; // 网格间距
}

.video-item {
  background-color: #fff;
  border-radius: 8px; // 圆角
  overflow: hidden; // 防止内容溢出
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); // 轻微阴影
  transition: transform 0.25s ease, box-shadow 0.25s ease; // 过渡效果
  display: flex; // 内部使用 flex 布局
  flex-direction: column; // 垂直排列封面和信息
  position: relative; // 为了编辑按钮定位

  .video-item-clickable { // 可点击区域
    cursor: pointer;
    display: flex;
    flex-direction: column;
    flex-grow: 1; // 占据父元素所有空间
  }

  &:hover {
    transform: translateY(-4px); // 轻微上移
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1); // 阴影加深

    .edit-video-btn { // 悬停时显示编辑按钮
      opacity: 1;
      visibility: visible;
    }
  }
}

.cover-container {
  width: 100%;
  padding-bottom: 56.25%; // 16:9 宽高比
  position: relative; // 用于内部元素绝对定位
  background-color: #f0f2f5; // 占位背景色
}

.video-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; // 保持比例填充
}

.placeholder-cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #c0c4cc;

  i {
    font-size: 36px;
    margin-bottom: 6px;
  }

  span {
    font-size: 13px;
  }
}

.video-info {
  padding: 10px 12px; // 视频信息内边距
  flex-grow: 1; // 占据剩余空间
}

.video-title {
  font-size: 14px; // 标题字号
  font-weight: 500;
  color: #303133;
  margin: 0 0 6px 0; // 底部间距
  line-height: 1.4;
  // 标题最多显示两行
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  min-height: 2.8em; // 保证两行高度
}

.video-meta {
  font-size: 12px; // 元数据字号
  color: #909399;
  display: flex;
  align-items: center;

  i { // 图标右边距
    margin-right: 4px;
    font-size: 14px; // 图标大小
  }

  span + span { // 同级 span 之间加间距
    margin-left: 12px;
  }
}

.edit-video-btn {
  position: absolute; // 绝对定位到右上角
  top: 8px;
  right: 8px;
  opacity: 0; // 默认隐藏
  visibility: hidden; // 配合 opacity
  transition: opacity 0.25s ease, visibility 0.25s ease;
  z-index: 10; // 确保在最上层
}

// --- 弹窗通用样式调整 ---
.el-dialog__header {
  border-bottom: 1px solid #e8eaec; // 弹窗头部加分割线
  padding: 14px 20px;
}

.el-dialog__title {
  font-size: 16px; // 弹窗标题字号
  font-weight: 500;
}

.el-dialog__body {
  padding: 20px; // 弹窗内容区内边距
}

.el-dialog__footer {
  border-top: 1px solid #e8eaec; // 弹窗底部加分割线
  padding: 10px 20px;
}


// --- 视频播放弹窗特定样式 ---
.video-player-dialog >>> .el-dialog__header { // 深度选择器覆盖默认样式
  padding: 10px 15px; // 减小头部内边距
}

.video-player-dialog >>> .el-dialog__body {
  padding: 0; // 视频播放器区域不要内边距
  background-color: #000; // 播放器背景为黑色
}

.video-player-dialog >>> .el-dialog__headerbtn { // 关闭按钮位置
  top: 12px;
  right: 15px;
}

.video-player-dialog >>> .el-dialog__close { // 关闭按钮图标
  font-size: 20px;
  color: #909399;
}

.video-player-container {
  width: 100%;
  // 高度可以由播放器内部或JS控制，或者使用宽高比
  // padding-bottom: 56.25%; // 16:9 示例
  // position: relative;
  height: 60vh; // 或者给一个视口相关的高度
  background-color: #111; // 深色背景
  display: flex; // 用于居中加载提示
  justify-content: center;
  align-items: center;
}

// 如果播放器初始化需要时间，显示加载提示
.player-loading-placeholder {
  color: #ccc;
  font-size: 16px;

  i {
    margin-right: 5px;
  }
}

// --- 粉丝/关注弹窗样式 ---
.fans-dialog-header {
  margin-bottom: 15px;
  // 可以用 flex 布局让按钮组和搜索框在一行
}

.user-list-container {
  max-height: 45vh; // 限制最大高度，出现滚动条
  overflow-y: auto;
  margin: 0 -20px; // 抵消 el-dialog__body 的 padding
  padding: 0 20px; // 再把 padding 加回来，滚动条不占内容区
}

.user-list-item {
  display: flex;
  align-items: center;
  padding: 12px 0; // 上下内边距
  border-bottom: 1px solid #f0f0f0; // 分割线
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none; // 最后一项无分割线
  }

  &:hover {
    background-color: #f7f8fa; // 悬停背景色
  }
}

.user-list-info {
  margin-left: 12px; // 头像和信息的间距
  display: flex;
  flex-direction: column; // 名字和ID垂直排列
  flex-grow: 1; // 占据剩余宽度
  overflow: hidden; // 防止内容溢出
}

.user-list-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 2px;
  white-space: nowrap; // 不换行
  overflow: hidden;
  text-overflow: ellipsis; // 超出部分显示省略号
}

.user-list-id {
  font-size: 12px;
  color: #909399;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-list-intro { // 如果要显示简介
  font-size: 12px;
  color: #606266;
  margin-top: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// --- 编辑个人资料弹窗 ---
.edit-profile-form {
  // 表单本身无需特殊样式
}

.edit-profile-form .el-form-item .el-avatar {
  vertical-align: middle; // 头像和按钮垂直对齐
}

// 滚动条美化 (可选，仅 Webkit 内核浏览器)
.user-list-container::-webkit-scrollbar {
  width: 5px;
}

.user-list-container::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}

.user-list-container::-webkit-scrollbar-track {
  background: transparent; // 背景透明
}
</style>
