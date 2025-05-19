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
  <div class="user-view-page-tiktok-style">

    <!-- 用户信息头部区域 -->
    <div class="user-header-card-tiktok">
      <el-row :gutter="20" type="flex" class="user-info-row-tiktok"> <!-- 移除 align="middle" 让 col 自己控制对齐 -->
        <!-- 头像列 -->
        <el-col :xs="24" :sm="6" :md="4" class="avatar-col-tiktok">
          <el-avatar :size="90" class="user-avatar-tiktok"
                     :src="userinfo.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"/>
        </el-col>

        <!-- 用户信息主列 -->
        <el-col :xs="24" :sm="12" :md="14" class="info-col-tiktok"> <!-- ✨ 调整栅格占比，给右侧按钮留更多空间 -->
          <h1 class="user-name-tiktok">{{ (userinfo && userinfo.name) || '用户加载中...' }}</h1>
          <p class="user-id-tiktok">ID: {{ userid || '未知' }}</p>
          <div class="user-stats-tiktok">
            <div class="stat-item-tiktok" @click="handleOpenFans('关注')">
              <span class="stat-count-tiktok">{{ (userinfo && userinfo.subscribeCount != null) ? userinfo.subscribeCount : 0 }}</span>
              <span class="stat-label-tiktok">关注</span>
            </div>
            <div class="stat-item-tiktok" @click="handleOpenFans('粉丝')">
              <span class="stat-count-tiktok">{{ (userinfo && userinfo.fansCount != null) ? userinfo.fansCount : 0 }}</span>
              <span class="stat-label-tiktok">粉丝</span>
            </div>
            <!--            <div class="stat-item-tiktok">
                          <span class="stat-count-tiktok">{{ (userinfo && userinfo.totalLikes != null) ? userinfo.totalLikes : 0 }}</span>
                          <span class="stat-label-tiktok">获赞</span>
                        </div>-->
          </div>
          <p class="user-intro-tiktok" :title="userinfo && userinfo.introduction">
            {{ (userinfo && userinfo.introduction) || '这家伙很酷，什么也没留下～ 😎' }}
          </p>
        </el-col>

        <!-- ✨ 操作按钮列：调整栅格占比，并确保内容右对齐 -->
        <el-col :xs="24" :sm="6" :md="6" class="action-col-tiktok">
          <div class="action-buttons-wrapper-tiktok"> <!-- 新增 wrapper 用于flex布局 -->
            <el-button v-if="isSelf" type="primary" plain round class="edit-profile-btn-tiktok" @click="handleOpenEdit">
              <i class="el-icon-edit"></i> 编辑资料
            </el-button>
            <div v-if="!isSelf" class="follow-actions-tiktok">
              <el-button v-if="isFollower === 0" type="primary" round class="follow-btn-tiktok main-action" @click="handleFollow(userid)">
                <i class="el-icon-plus"></i> 关注
              </el-button>
              <el-button v-if="isFollower === 1" type="default" round plain class="follow-btn-tiktok" @click="handleUnFollow(userid)">
                <i class="el-icon-check"></i> 已关注
              </el-button>
              <el-button v-if="isFollower === 2" type="default" round plain class="follow-btn-tiktok" @click="handleUnFollow(userid)">
                <i class="el-icon-refresh-right"></i> 互相关注
              </el-button>
              <!--              <el-button type="default" round plain icon="el-icon-message" class="message-btn-tiktok">私信</el-button>-->
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 视频内容区域 -->
    <div class="content-card-tiktok">
      <div class="tabs-header-tiktok">
        <!-- Tabs保持不变 -->
        <div
            class="tab-item-tiktok"
            :class="{ 'is-active': option === 'create' }"
            @click="searchUserVideo('create', userid)">
          <i class="el-icon-film"></i> 作品
        </div>
        <div
            class="tab-item-tiktok"
            :class="{ 'is-active': option === 'like' }"
            @click="searchUserVideo('like', userid)">
          <i class="el-icon-star-off"></i> 喜欢
        </div>
        <div
            v-if="isSelf"
            class="tab-item-tiktok"
            :class="{ 'is-active': option === 'history' }"
            @click="searchUserVideo('history', userid)">
          <i class="el-icon-time"></i> 历史
        </div>
      </div>

      <div class="video-grid-wrapper-tiktok" v-loading="searchVideoLoading" element-loading-text="正在努力加载..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(24, 24, 24, 0.8)">
        <el-empty
            v-if="!searchVideoLoading && (!aboutVideos || (Array.isArray(aboutVideos) && aboutVideos.length === 0) || (typeof aboutVideos === 'object' && Object.keys(aboutVideos).length === 0))"
            image-size="100"
            class="empty-state-tiktok"
            description="列表为空哦～">
        </el-empty>
        <div v-else class="video-grid-tiktok">
          <div v-for="(item, index) in aboutVideos" :key="item && (item.videoId || item.id || index)" class="video-item-tiktok">
            <div v-if="item" class="video-item-clickable-tiktok" @click="showVideo(item, index)">
              <div class="cover-container-tiktok">
                <img v-if="item.coverUrl" :src="item.coverUrl" :alt="(item.title || '视频封面')" class="video-cover-tiktok" @error="onCoverError($event, item)"/>
                <div v-else class="placeholder-cover-tiktok">
                  <i class="el-icon-video-camera-solid"></i>
                </div>
                <!-- ✨ 播放量移到封面右上角，更像抖音 -->
                <div class="video-play-count-on-cover-tiktok" v-if="item.likeCount != null"> <!-- 原来是 viewCount，现在用 likeCount -->
                  <i class="el-icon-caret-right"></i> {{ item.likeCount }}
                </div>
              </div>
              <!-- ✨ 视频信息（标题和可选的点赞数）放到封面下方 -->
              <div class="video-info-below-cover-tiktok">
                <h3 class="video-title-tiktok" :title="item.title">{{ item.title || '视频标题加载中...' }}</h3>
                <!-- <div class="video-likes-tiktok" v-if="item.likeCount != null">
                  <i class="el-icon-thumb"></i> {{ item.likeCount }}
                </div> -->
              </div>
            </div>
            <div v-else class="video-item-placeholder-tiktok">数据加载错误</div>
            <el-button
                v-if="isSelf && option === 'create' && item"
                class="edit-video-btn-tiktok"
                type="text"
                icon="el-icon-more"
                @click.stop="editVideo(item)"
                title="更多操作">
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹窗区域 (保持不变) -->
    <UserVideoPlayerDialog ref="videoDialog"></UserVideoPlayerDialog>
    <el-dialog title="编辑视频信息" :visible.sync="dialogVisible.videoEdit" :before-close="handleCloseVideoEdit"
               width="600px" custom-class="edit-dialog-tiktok" append-to-body>
      <div v-if="currentEditingVideo">
        <el-form :model="currentEditingVideo" label-width="80px">
          <el-form-item label="标题">
            <el-input v-model="currentEditingVideo.title" placeholder="输入视频标题"></el-input>
          </el-form-item>
          <el-form-item label="简介">
            <el-input type="textarea" :rows="3" v-model="currentEditingVideo.description" placeholder="输入视频简介"></el-input>
          </el-form-item>
        </el-form>
      </div>
      <div v-else class="dialog-loading-tiktok">加载中或数据错误...</div>
      <span slot="footer" class="dialog-footer-tiktok">
         <el-button @click="handleCloseVideoEdit" size="medium" class="dialog-btn-cancel-tiktok">取 消</el-button>
         <el-button type="primary" @click="submitVideoEdit" size="medium" class="dialog-btn-confirm-tiktok" :disabled="!currentEditingVideo">确 定</el-button>
       </span>
    </el-dialog>
    <el-dialog :title="(dialogVisible.fans && activeFanTab === '关注' ? '关注列表' : (dialogVisible.fans && activeFanTab === '粉丝' ? '粉丝列表' : '用户列表'))"
               :visible.sync="dialogVisible.fans" :before-close="handleCloseFans" width="450px"
               custom-class="fans-dialog-tiktok" append-to-body>
      <div class="fans-dialog-header-tiktok">
        <el-button-group style="margin-bottom: 15px;">
          <el-button size="small" :type="activeFanTab === '关注' ? 'primary' : 'default'" @click="handleOpenFans('关注')">关注</el-button>
          <el-button size="small" :type="activeFanTab === '粉丝' ? 'primary' : 'default'" @click="handleOpenFans('粉丝')">粉丝</el-button>
        </el-button-group>
        <el-input
            placeholder="搜索用户"
            prefix-icon="el-icon-search"
            v-model="input_searchUser"
            clearable
            @clear="clearSearchUser"
            size="small"
            class="fan-search-input-tiktok">
        </el-input>
      </div>
      <div class="user-list-container-tiktok" v-loading="searchVideoLoading" element-loading-text="加载中..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(30, 30, 30, 0.8)">
        <el-empty
            v-if="!searchVideoLoading && (!userList || (Array.isArray(userList) && userList.length === 0) || (typeof userList === 'object' && Object.keys(userList).length === 0))"
            image-size="80"
            class="empty-state-fans-tiktok"
            description="列表为空">
        </el-empty>
        <div v-else class="user-list-tiktok">
          <div
              v-for="(user) in userList"
              :key="user && user.userId"
              class="user-list-item-tiktok"
              @click="toUser(user.userId)">
            <el-avatar :size="45" class="user-list-avatar-tiktok"
                       :src="user && (user.avatarUrl || user.avatar) || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
            <div class="user-list-info-tiktok">
              <span class="user-list-name-tiktok">{{ user && user.userName || '未知用户' }}</span>
              <span class="user-list-id-tiktok">ID: {{ user && user.userId || '未知' }}</span>
            </div>
            <el-button v-if="user && userid !== user.userId && user.relationStatus === 0" @click.stop="handleFollow(user.userId)" size="mini" type="primary" round class="list-action-btn-tiktok follow">关注</el-button>
            <el-button v-if="user && userid !== user.userId && user.relationStatus === 1" @click.stop="handleUnFollow(user.userId)" size="mini" type="default" plain round class="list-action-btn-tiktok followed">已关注</el-button>
            <el-button v-if="user && userid !== user.userId && user.relationStatus === 2" @click.stop="handleUnFollow(user.userId)" size="mini" type="default" plain round class="list-action-btn-tiktok mutual">互相关注</el-button>
          </div>
        </div>
      </div>
    </el-dialog>
    <el-dialog title="编辑个人资料" :visible.sync="dialogVisible.editIntro" :before-close="handleCloseEdit"
               width="500px" :close-on-click-modal="false" custom-class="edit-dialog-tiktok" append-to-body v-loading="upAvatarLoading" element-loading-text="处理中...">
      <el-form :model="editForm" ref="editProfileFormRef" label-position="top" class="edit-profile-form-tiktok">
        <el-form-item label="头像" prop="profile" class="avatar-form-item-tiktok">
          <el-avatar :size="80" class="edit-avatar-tiktok"
                     :src="editForm.displayProfile || editForm.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
          <el-upload
              class="avatar-uploader-trigger-tiktok"
              action="#"
              :limit="1"
              :on-change="handleChangeImage"
              :http-request="customUploadRequest"
              :show-file-list="false"
              accept="image/jpeg,image/png,image/gif">
            <el-button size="small" type="primary" plain>更换头像</el-button>
          </el-upload>
          <div class="el-upload__tip">支持jpg/png/gif格式，大小不超过2MB</div>
        </el-form-item>
        <el-form-item label="昵称" prop="name">
          <el-input v-model.trim="editForm.name" placeholder="好名字更容易被记住哦" maxlength="15" show-word-limit></el-input>
        </el-form-item>
        <el-form-item label="简介" prop="introduction">
          <el-input type="textarea" v-model="editForm.introduction" placeholder="简单介绍一下你自己吧" rows="3"
                    maxlength="80" show-word-limit></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer-tiktok">
        <el-button @click="handleCloseEdit" size="medium" class="dialog-btn-cancel-tiktok">取 消</el-button>
        <el-button type="primary" @click="submitEditUserInfo" size="medium" class="dialog-btn-confirm-tiktok" :loading="upAvatarLoading">保 存</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<style>

/* --- 页面整体与卡片样式 --- */
.user-view-page-tiktok-style {
  height: 100%;
  padding: 0;
  background-color: #000000;
  box-sizing: border-box;
  overflow-y: auto;
  color: #f1f1f1;
}

.user-header-card-tiktok {
  background-color: #000000;
  padding: 20px 15px 15px;
  border-bottom: 1px solid #2c2c2c;
  box-shadow: none;
  border-radius: 0;
}
.content-card-tiktok {
  background-color: #000000;
  border-radius: 0;
  box-shadow: none;
  padding-top: 0;
}
.content-card-tiktok >>> .el-card__body {
  padding: 0;
}

/* --- 用户信息头部 --- */
.user-info-row-tiktok {
  align-items: flex-start; /* 确保顶部对齐 */
}
.avatar-col-tiktok {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* ✨ 头像也顶部对齐，如果希望与文字块顶部对齐 */
  padding-top: 5px;
}
.user-avatar-tiktok {
  border: 2px solid #333;
  box-shadow: 0 4px 10px rgba(0,0,0,0.3);
}

.info-col-tiktok {
  padding-left: 20px !important; /* Element UI gutter 会产生 padding，这里可以覆盖 */
  display: flex;
  flex-direction: column;
}

.user-name-tiktok {
  font-size: 22px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #ffffff;
  line-height: 1.2;
}

.user-id-tiktok {
  font-size: 13px;
  color: #a0a0a0;
  margin-bottom: 12px;
}

.user-stats-tiktok {
  display: flex;
  gap: 25px;
  margin-bottom: 12px;
}
.stat-item-tiktok {
  display: flex;
  align-items: baseline;
  cursor: pointer;
  color: #f1f1f1;
  transition: color 0.2s ease;
}
.stat-item-tiktok:hover {
  color: #FE2C55;
}
.stat-count-tiktok {
  font-size: 17px;
  font-weight: 600;
  margin-right: 5px;
}
.stat-label-tiktok {
  font-size: 13px;
  color: #a0a0a0;
}

.user-intro-tiktok {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 15px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

/* ✨ 修改：确保操作按钮列靠右，并且其内部的按钮组也正确排列 */
.action-col-tiktok {
  display: flex;
  justify-content: flex-end; /* 确保内容（wrapper）靠右 */
  align-items: flex-start;   /* 操作按钮与用户信息区域顶部对齐 */
}
.action-buttons-wrapper-tiktok { /* 新增的包裹层 */
  display: flex;
  flex-direction: column; /* 如果希望编辑资料和关注按钮垂直堆叠 */
  align-items: flex-end; /* 按钮在包裹层内也靠右 */
  gap: 10px; /* 按钮之间的垂直间距 */
}
@media (min-width: 768px) { /* 在较大屏幕上，按钮可以水平排列 */
  .action-buttons-wrapper-tiktok {
    flex-direction: row;
    align-items: center; /* 水平排列时垂直居中 */
  }
}


.edit-profile-btn-tiktok,
.follow-btn-tiktok,
.message-btn-tiktok {
  border-radius: 4px;
  font-weight: 600;
  font-size: 14px;
  padding: 8px 15px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.edit-profile-btn-tiktok i,
.follow-btn-tiktok i {
  margin-right: 6px;
}
.edit-profile-btn-tiktok {
  color: #f1f1f1;
  background-color: #282828;
  border-color: #3a3a3a;
}
.edit-profile-btn-tiktok:hover {
  background-color: #333333;
  border-color: #4a4a4a;
}
.follow-btn-tiktok.main-action {
  background-color: #FE2C55;
  border-color: #FE2C55;
  color: #ffffff;
}
.follow-btn-tiktok.main-action:hover {
  background-color: #ff4d70;
  border-color: #ff4d70;
}
.follow-actions-tiktok { /* 包裹关注按钮组和私信按钮，确保它们在一行 */
  display: flex;
  gap: 10px;
  align-items: center; /* 如果按钮高度不一致，垂直居中 */
}
.follow-btn-tiktok.el-button--default.is-plain,
.message-btn-tiktok {
  color: #f1f1f1;
  background-color: #282828;
  border-color: #3a3a3a;
}
.follow-btn-tiktok.el-button--default.is-plain:hover,
.message-btn-tiktok:hover {
  background-color: #333333;
  border-color: #4a4a4a;
}


/* --- 内容区域 Tabs 和视频网格 --- */
.tabs-header-tiktok {
  display: flex;
  justify-content: space-around;
  padding: 0;
  border-bottom: 1px solid #2c2c2c;
  background-color: #101010;
  height: 48px;
}
.tab-item-tiktok {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
  cursor: pointer;
  color: #a0a0a0;
  font-size: 15px;
  font-weight: 500;
  position: relative;
  transition: color 0.2s ease;
}
.tab-item-tiktok i {
  font-size: 18px;
  margin-right: 6px;
}
.tab-item-tiktok.is-active {
  color: #ffffff;
}
.tab-item-tiktok.is-active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 30%;
  min-width: 24px;
  height: 2.5px; /* 调整指示器厚度 */
  background-color: #f1f1f1;
  border-radius: 1.25px; /* 圆角指示器 */
}
.tab-item-tiktok:hover {
  color: #f1f1f1;
}
.tab-count-tiktok {
  font-size: 12px;
  color: #a0a0a0;
  margin-left: 4px;
  font-weight: normal;
}
.tab-item-tiktok.is-active .tab-count-tiktok {
  color: #f1f1f1;
}

.video-grid-wrapper-tiktok {
  min-height: 300px; /* 保证一个最小高度，让loading和empty状态有空间显示 */
  position: relative;   /* 关键：为 v-loading 的绝对定位提供基准 */
  padding: 1.5px;
  background-color: #000000; /* 暗色背景 */
  display: flex;        /* 用于内部 el-empty 或其他占位内容的居中 */
  flex-direction: column;
  flex-grow: 1;         /* 如果父容器是flex，允许其伸展 */
}

/* v-loading 样式 */
.video-grid-wrapper-tiktok >>> .el-loading-mask {
  background-color: rgba(16, 16, 16, 0.9) !important;
  border-radius: inherit;
  z-index: 10;
}
.video-grid-wrapper-tiktok >>> .el-loading-spinner .el-icon-loading {
  font-size: 32px !important;
  color: #FE2C55 !important;
}
.video-grid-wrapper-tiktok >>> .el-loading-spinner .el-loading-text {
  color: #e0e0e0 !important;
  font-size: 15px !important;
  margin-top: 10px !important;
}

/* el-empty 样式 */
.video-grid-wrapper-tiktok .el-empty { /* 直接目标，不需要深度，除非el-empty是子组件的根 */
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 50px 20px;
  background-color: transparent;
  width: 100%;
}
.video-grid-wrapper-tiktok >>> .el-empty__image { /* 内部元素用深度 */
  width: 120px;
}
.video-grid-wrapper-tiktok >>> .el-empty__description p {
  color: #a0a0a0;
  font-size: 16px;
  line-height: 1.6;
}
/* ... (如果还有其他内部元素需要调整) ... */

.video-grid-tiktok { /* 视频网格本身的样式 */
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5px;
}
.empty-state-tiktok {
  padding: 50px 0;
  background-color: #000000;
}
.empty-state-tiktok >>> .el-empty__description p {
  color: #a0a0a0;
  font-size: 15px;
}

.video-grid-tiktok {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5px;
}

.video-item-tiktok {
  background-color: #181818;
  overflow: hidden;
  position: relative;
  display: flex; /* ✨ 改为 flex，让 clickable 区域和 info 区域正确排列 */
  flex-direction: column; /* ✨ 垂直排列 */
}
.video-item-clickable-tiktok {
  cursor: pointer;
  display: block; /* 或者 flex: 1; display: flex; flex-direction: column; */
  text-decoration: none;
  color: inherit;
  /* ✨ 移除 flex-grow: 1; 因为父级 .video-item-tiktok 已经是 flex container */
}
.video-item-tiktok:hover .video-cover-tiktok {
  transform: scale(1.03);
}
.video-item-placeholder-tiktok {
  padding-bottom: 133.33%;
  background-color: #181818;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #555;
  font-size: 12px;
}

.cover-container-tiktok {
  width: 100%;
  padding-bottom: 133.33%;
  position: relative;
  background-color: #101010;
  overflow: hidden;
}
.video-cover-tiktok {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.placeholder-cover-tiktok {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #555555;
}
.placeholder-cover-tiktok i {
  font-size: 48px;
}
.video-play-count-on-cover-tiktok { /* ✨ 新增：播放量在封面上方 */
  position: absolute;
  bottom: 8px;
  left: 8px;
  background-color: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 11px; /* ✨ 调小一点 */
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 3px; /* ✨ 小圆角 */
  display: flex;
  align-items: center;
  z-index: 2; /* 确保在封面上 */
}
.video-play-count-on-cover-tiktok i {
  font-size: 12px; /* ✨ */
  margin-right: 3px; /* ✨ */
  transform: translateY(1px); /* 微调图标位置 */
}

/* ✨ 修改：视频信息放到封面下方 */
.video-info-below-cover-tiktok {
  padding: 8px 10px; /* 调整内边距 */
  background-color: #181818; /* 与视频项背景一致，或者略有区分 */
  min-height: 40px; /* 给标题留出足够空间 */
  box-sizing: border-box;
}
.video-title-tiktok { /* 标题现在在下方 */
  font-size: 14px; /* 调整标题大小 */
  font-weight: 500;
  color: #e0e0e0; /* 标题颜色 */
  margin: 0;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 如果希望标题可以换行，则移除 white-space, overflow, text-overflow，并设置 display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; */
}
/* 如果需要在下方也显示点赞数 */
/*
.video-likes-tiktok {
  font-size: 12px;
  color: #a0a0a0;
  margin-top: 4px;
  display: flex;
  align-items: center;
}
.video-likes-tiktok i {
  margin-right: 4px;
}
*/

.edit-video-btn-tiktok {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5; /* 确保在视频信息层之上，但在播放量之下或同级 */
  background-color: rgba(30, 30, 30, 0.6) !important;
  border-color: transparent !important;
  color: #f1f1f1 !important;
  width: 28px;
  height: 28px;
  padding: 0 !important;
  border-radius: 50%;
  font-size: 16px;
  line-height: 28px;
  text-align: center;
}
.edit-video-btn-tiktok:hover {
  background-color: rgba(50, 50, 50, 0.8) !important;
}

/* --- 弹窗通用样式调整 (暗色) --- */
.edit-dialog-tiktok.el-dialog,
.fans-dialog-tiktok.el-dialog {
  background-color: #1e1e1e;
  border-radius: 10px;
  box-shadow: 0 0 25px rgba(0,0,0,0.5);
}
.user-view-page-tiktok-style >>> .el-dialog.edit-dialog-tiktok .el-dialog__header,
.user-view-page-tiktok-style >>> .el-dialog.fans-dialog-tiktok .el-dialog__header {
  border-bottom: 1px solid #2c2c2c;
  padding: 18px 20px;
}
.user-view-page-tiktok-style >>> .el-dialog.edit-dialog-tiktok .el-dialog__title,
.user-view-page-tiktok-style >>> .el-dialog.fans-dialog-tiktok .el-dialog__title {
  font-size: 17px;
  font-weight: 600;
  color: #f1f1f1;
}
.user-view-page-tiktok-style >>> .el-dialog.edit-dialog-tiktok .el-dialog__headerbtn .el-dialog__close,
.user-view-page-tiktok-style >>> .el-dialog.fans-dialog-tiktok .el-dialog__headerbtn .el-dialog__close {
  color: #a0a0a0;
}
.user-view-page-tiktok-style >>> .el-dialog.edit-dialog-tiktok .el-dialog__headerbtn .el-dialog__close:hover,
.user-view-page-tiktok-style >>> .el-dialog.fans-dialog-tiktok .el-dialog__headerbtn .el-dialog__close:hover {
  color: #FE2C55;
}
.user-view-page-tiktok-style >>> .el-dialog.edit-dialog-tiktok .el-dialog__body,
.user-view-page-tiktok-style >>> .el-dialog.fans-dialog-tiktok .el-dialog__body {
  padding: 20px 25px;
  color: #e0e0e0;
}
.user-view-page-tiktok-style >>> .el-dialog.edit-dialog-tiktok .el-dialog__footer,
.user-view-page-tiktok-style >>> .el-dialog.fans-dialog-tiktok .el-dialog__footer {
  border-top: 1px solid #2c2c2c;
  padding: 12px 20px;
  background-color: #1e1e1e;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
}
.dialog-btn-cancel-tiktok {
  background-color: #282828;
  border-color: #3a3a3a;
  color: #f1f1f1;
}
.dialog-btn-cancel-tiktok:hover {
  background-color: #333333;
  border-color: #4a4a4a;
}
.dialog-btn-confirm-tiktok {
  background-color: #FE2C55;
  border-color: #FE2C55;
  color: #ffffff;
}
.dialog-btn-confirm-tiktok:hover {
  background-color: #ff4d70;
  border-color: #ff4d70;
}

/* --- 粉丝/关注弹窗样式 (暗色) --- */
.fans-dialog-tiktok .fans-dialog-header-tiktok {
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.fan-tabs-tiktok {
  width: 100%;
}
.user-view-page-tiktok-style >>> .fans-dialog-tiktok .fan-tabs-tiktok .el-tabs__header {
  margin-bottom: 10px;
  background-color: transparent;
}
.user-view-page-tiktok-style >>> .fans-dialog-tiktok .fan-tabs-tiktok .el-tabs__nav-wrap::after {
  display: none;
}
.user-view-page-tiktok-style >>> .fans-dialog-tiktok .fan-tabs-tiktok .el-tabs__item {
  color: #a0a0a0;
  font-size: 15px;
  font-weight: 500;
  padding: 0 20px;
  height: 40px;
  line-height: 40px;
}
.user-view-page-tiktok-style >>> .fans-dialog-tiktok .fan-tabs-tiktok .el-tabs__item.is-active {
  color: #f1f1f1;
}
.user-view-page-tiktok-style >>> .fans-dialog-tiktok .fan-tabs-tiktok .el-tabs__active-bar {
  background-color: #FE2C55;
  height: 2.5px;
}
.fan-search-input-tiktok >>> .el-input__inner {
  background-color: #101010;
  border-color: #2c2c2c;
  color: #f1f1f1;
  border-radius: 18px;
}
.fan-search-input-tiktok >>> .el-input__inner::placeholder {
  color: #555555;
}
.fan-search-input-tiktok >>> .el-input__prefix .el-input__icon {
  color: #a0a0a0;
}

.user-list-container-tiktok {
  max-height: 55vh;
  overflow-y: auto;
  margin: 0 -25px;
  padding: 0 25px;
}
.user-list-container-tiktok >>> .el-loading-mask { background-color: rgba(30, 30, 30, 0.85); }
.user-list-container-tiktok >>> .el-loading-spinner .el-icon-loading { color: #FE2C55; }
.user-list-container-tiktok >>> .el-loading-spinner .el-loading-text { color: #f1f1f1;}

.empty-state-fans-tiktok >>> .el-empty__description p {
  color: #a0a0a0;
}

.user-list-item-tiktok {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #2c2c2c;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.user-list-item-tiktok:last-child {
  border-bottom: none;
}
.user-list-item-tiktok:hover {
  background-color: #222222;
}

.user-list-avatar-tiktok {
  border: 1px solid #3a3a3a;
}
.user-list-info-tiktok {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow: hidden;
}
.user-list-name-tiktok {
  font-size: 15px;
  font-weight: 500;
  color: #f1f1f1;
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-list-id-tiktok {
  font-size: 12px;
  color: #a0a0a0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.list-action-btn-tiktok {
  margin-left: auto;
  flex-shrink: 0;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 500;
}
.list-action-btn-tiktok.follow {
  background-color: #FE2C55;
  border-color: #FE2C55;
  color: #fff;
}
.list-action-btn-tiktok.followed,
.list-action-btn-tiktok.mutual {
  background-color: #282828;
  border-color: #3a3a3a;
  color: #a0a0a0;
}

/* --- 编辑个人资料弹窗 (暗色) --- */
.edit-profile-form-tiktok {
}
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-form-item__label {
  color: #f1f1f1;
  font-weight: 500;
  line-height: normal;
  padding-bottom: 6px;
}
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-input__inner,
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-textarea__inner {
  background-color: #101010;
  border-color: #2c2c2c;
  color: #f1f1f1;
  border-radius: 4px;
}
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-input__inner::placeholder,
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-textarea__inner::placeholder {
  color: #555555;
}
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-input.is-active .el-input__inner,
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-input__inner:focus,
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-textarea__inner:focus {
  border-color: #FE2C55;
}
.user-view-page-tiktok-style >>> .edit-dialog-tiktok .edit-profile-form-tiktok .el-input__count .el-input__count-inner {
  background-color: transparent;
  color: #555555;
}

.avatar-form-item-tiktok {
  display: flex;
  align-items: center;
}
.avatar-form-item-tiktok >>> .el-form-item__content {
  display: flex;
  align-items: center;
  margin-left: 0 !important;
}
.edit-avatar-tiktok {
  border: 2px solid #3a3a3a;
  margin-right: 15px;
}
.avatar-uploader-trigger-tiktok .el-button {
  background-color: #282828;
  border-color: #3a3a3a;
  color: #f1f1f1;
}
.avatar-uploader-trigger-tiktok .el-button:hover {
  background-color: #333333;
  border-color: #4a4a4a;
}
.edit-profile-form-tiktok .el-upload__tip {
  font-size: 12px;
  color: #a0a0a0;
  line-height: 1.4;
  margin-top: 8px;
  margin-left: 10px;
  display: block;
}

/* --- 滚动条美化 (暗色主题) --- */
.user-view-page-tiktok-style::-webkit-scrollbar,
.tabs-header-tiktok::-webkit-scrollbar,
.user-list-container-tiktok::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.user-view-page-tiktok-style::-webkit-scrollbar-thumb,
.tabs-header-tiktok::-webkit-scrollbar-thumb,
.user-list-container-tiktok::-webkit-scrollbar-thumb {
  background-color: #282828;
  border-radius: 3px;
}
.user-view-page-tiktok-style::-webkit-scrollbar-thumb:hover,
.tabs-header-tiktok::-webkit-scrollbar-thumb:hover,
.user-list-container-tiktok::-webkit-scrollbar-thumb:hover {
  background-color: #333333;
}
.user-view-page-tiktok-style::-webkit-scrollbar-track,
.tabs-header-tiktok::-webkit-scrollbar-track,
.user-list-container-tiktok::-webkit-scrollbar-track {
  background: transparent;
}

.user-view-page-tiktok-style,
.tabs-header-tiktok,
.user-list-container-tiktok {
  scrollbar-width: thin;
  scrollbar-color: #282828 transparent;
}
</style>
