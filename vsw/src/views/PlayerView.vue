// PlayerView.vue - TEMPLATE
<template>
  <div style="height: 100%">
    <div class="swiper-container">
      <div class="swiper-wrapper" ref="mySwiper">
        <div class="swiper-slide" v-for="(item,index) in videoList" :key="index" ref="swiperSlides">
          <!-- sliderVideo 现在是 Flex 容器 -->
          <div class="sliderVideo" v-if="item.player!==-1">
            <!-- Player 区域 -->
            <div class="player-main-area">
              <div class="playerContainer">
                <div :ref="`video${index}`" class="video-container"></div>
                <div class="video-info-overlay">
                  <div class="video-description">
                    <p class="author-name">@{{ item.userName }}</p>
                    <p class="video-title">{{ item.title }}</p>
                    <p class="video-detail-desc">{{ item.description }}</p>
                  </div>
                </div>
                <div class="control-buttons-panel">
                  <!-- ... 您的控制按钮 ... -->
                  <div class="control-button-item user-avatar-button" @click="toUserPage(item.userId)">
                    <el-avatar :size="50" :src="item.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
                    <div class="follow-icon-container" v-if="item.relation!==-1 && item.isFollow===false" @click.stop="handleFollow(index)">
                      <i class="el-icon-plus"></i>
                    </div>
                  </div>
<!--                  <div class="control-button-item" v-if="item.relation!==-1 && item.isFollow===true">
                    <el-button type="text" @click="handleUnFollow(index)" class="unfollow-button">
                      已关注
                    </el-button>
                  </div>-->
                  <div class="control-button-item">
                    <el-button
                        type="text"
                        :icon="item.isLike ? 'el-icon-star-on' : 'el-icon-star-off'"
                        @click="item.isLike ? handleUnLikeButton(index) : handleLikeButton(index)"
                        :class="{ 'liked': item.isLike }"
                    ></el-button>
                    <span class="count-text">{{ item.likeCount | formatCount }}</span>
                  </div>
                  <div class="control-button-item">
                    <el-button type="text" icon="el-icon-chat-dot-round" @click="handleCommentButton(index)"></el-button>
                    <span class="count-text">{{ item.commentCount | formatCount }}</span>
                  </div>
                  <div class="control-button-item">
                    <el-button type="text" icon="el-icon-more-outline" @click="handleMoreButton(index)"></el-button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 评论区组件，作为 Flex item -->
            <video-side-card
                :ref="`videoSideCard${index}`"
                class="comment-panel-sider"
            ></video-side-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="stylus">
/* Swiper 基础样式保持不变 */
.swiper-container {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  display: flex;
  position: relative;
  background-color: #000;
  overflow: hidden; /* 防止子元素溢出 slide */
}

.sliderVideo { /* ✨ Flex 容器 ✨ */
  display: flex;
  flex-direction: row; /* 水平排列 */
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.player-main-area { /* ✨ Flex item - 视频播放区域 ✨ */
  flex-grow: 1;
  flex-shrink: 1;
  width: 100%; /* 初始宽度，当评论区显示时会被压缩 */
  height: 100%;
  position: relative;
  overflow: hidden;
  transition: width 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}

.playerContainer { /* 播放器和控件的直接容器 */
  width: 100%;
  height: 100%;
  position: relative;
}

.video-container { /* XGPlayer 挂载点 */
  width: 100%;
  height: 100%;
}

.comment-panel-sider { /* ✨ Flex item - 评论区 ✨ */
  width: 350px; /* 评论区宽度，可以根据需要调整 */
  height: 100%;
  flex-shrink: 0; /* 不允许被压缩 */
  z-index: 1000; /* 确保在最上层 */
  background-color: #1c1c1e; /* 给评论区一个背景色，方便调试和视觉区分 */
  /* 初始隐藏/显示由 videoSideCard 内部逻辑或父组件的 v-show/v-if 控制 */
  /* 当它不显示时（display: none），.player-main-area 会自动占据全部空间 */
  overflow: hidden; /* 确保内部内容不溢出 */
}

/* --- 视频信息覆盖层 --- */
.video-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: calc(100% - 70px); /* 减去右侧按钮区域的大致宽度，防止重叠 */
  padding: 15px 15px 20px 15px; /* 增加底部padding，为进度条（如果将来有）留空间 */
  background: linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0));
  color: white;
  z-index: 10;
  pointer-events: none; /* 允许点击穿透到视频本身 */
  box-sizing: border-box;
}

.video-info-overlay .video-description { /* 使描述文字可选中文本 */
  pointer-events: auto;
}

.video-info-overlay .video-description .author-name {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 5px;
}

.video-info-overlay .video-description .video-title {
  font-size: 20px;
  margin-bottom: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-info-overlay .video-description .video-detail-desc {
  font-size: 13px;
  line-height: 1.4;
  max-height: 4.2em; /* 限制描述最多显示3行 */
  overflow: hidden;
  text-overflow: ellipsis;
  /* 对于多行省略号，更复杂的JS或CSS技巧可能是必要的 */
}

/* --- 右侧控制按钮面板 --- */
.control-buttons-panel {
  position: absolute;
  bottom: 20px;
  right: 10px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;
  gap: 20px;
}

.control-button-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  /* width: 100%; */ /* 考虑移除或调整，看是否需要 item 占满宽度，或者让其内容决定宽度 */
  /* font-size: 40px; */ /* 这个 font-size 作用于 item 内的文本，如果按钮有自己的font-size，它会被覆盖 */

  /* "已关注" 按钮的特定样式 */
  .unfollow-button { // 这是 el-button，所以下面更通用的 el-button 样式也可能影响它
    font-size: 16px; /* 调整“已关注”文字大小 */
    color: #ccc;
    padding: 4px 8px;
    background-color: rgba(255,255,255,0.2);
    border-radius: 4px;
    line-height: 1.2; /* 调整行高 */
    /* 确保它有足够的 width 和 height，或者让 padding 撑开 */
  }
  .unfollow-button.el-button--text { // 更精确地定位
    color: #ccc;
  }
  .unfollow-button.el-button--text:hover,
  .unfollow-button.el-button--text:focus {
    color: #fff;
    background-color: rgba(255,255,255,0.3);
  }


  /* 通用 el-button 图标按钮样式 */
  .el-button.el-button--text { // 使用 Element UI 的类名提高特异性
    font-size: 30px;    /* 期望图标的字体大小 */
    color: white;
    padding: 5px;       /* 给一点内边距，让图标不贴边，也可以是0 */
    margin: 0;
    width: 40px;        /* 按钮宽度 = font-size + padding*2 (大约) */
    height: 40px;       /* 按钮高度 = font-size + padding*2 (大约) */
    min-width: auto;    /* 覆盖 Element UI 可能的 min-width */
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%; /* 如果想让按钮背景是圆形的 */
    transition: transform 0.2s ease, background-color 0.2s ease;

    i { // 图标本身
      font-size: inherit; /* 继承 el-button 的 font-size */
      font-weight: normal;
      line-height: 1; /* 确保图标在按钮内垂直对齐 */
    }
  }

  .el-button.el-button--text:hover {
    transform: scale(1.1); /* 调整 hover 放大 */
    background-color: rgba(255, 255, 255, 0.1); /* 可选的 hover 背景色 */
  }

  /* 点赞高亮状态 */
  .el-button.el-button--text.liked,
  .el-button.el-button--text.liked i {
    color: #FFD700;
  }

  /* 计数文本样式 */
  .count-text {
    font-size: 13px;
    color: white;
    margin-top: 4px;
    font-weight: 500;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
  }
}

/* 特殊处理用户头像按钮 (保持不变，除非也需要调整) */
.control-button-item.user-avatar-button {
  position: relative;
}
.control-button-item.user-avatar-button .el-avatar {
  border: 2px solid white;
  box-shadow: 0 0 10px rgba(0,0,0,0.5);
}

/* 加号关注图标容器 (保持不变，除非也需要调整) */
.follow-icon-container {
  position: absolute;
  bottom: -5px;
  right: 15px; // 注意：你截图这里是右侧点赞按钮，不是头像上的关注按钮
  width: 20px;
  height: 20px;
  background-color: #ff3b5c;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.5);
  cursor: pointer;
  transition: transform 0.2s ease;
}
.follow-icon-container:hover {
  transform: scale(1.15);
}
.follow-icon-container i {
  font-weight: bold;
}
.follow-icon-container:hover {
  transform: scale(1.15);
}
.follow-icon-container i {

  font-weight: bold; /* 加粗加号 */
}

/* Element UI 按钮的全局覆盖 (如果需要，但通常在组件内精确控制更好) */
/* .el-button { ... } */

/* 西瓜播放器相关 (如果需要隐藏默认控件等) */
/* :deep(.xgplayer-controls) { display: none !important; } */
</style>

<script>
import Swiper from 'swiper';
import 'swiper/css/swiper.min.css';

import Player, {Events} from 'xgplayer';

import 'xgplayer/dist/index.min.css';

import axios from "axios";
import dayjs from "dayjs";
import videoSideCard from "@/views/VideoCard/VideoSideCard.vue";
import handleMainMenu from "@/utils/handleMainMenu";
export default {
  components:{videoSideCard},
  props: {
    // Prop 用于接收一个返回 Promise 的函数，该函数负责加载初始视频列表
    loadInitialVideosFunction: {
      type: Function,
      required: true // 设为必需，确保父组件提供
    },
    // Prop 用于接收一个返回 Promise 的函数，该函数负责加载更多视频
    loadMoreVideosFunction: {
      type: Function,
      required: true // 设为必需
    }
  },
  data() {
    return {
      videoList: [],
      page: 0,
      lastPage:null,
      players: [],
      mySwiper: null,
      userid: '',
      player_up: null,
      player_down: null,
      player_now: null,
      isLoadingInitial: false,
      isLoadingMore: false,
    }
  },
  watch: {

  },
  beforeRouteEnter() {

  },
  created() {

  },
  destroyed() {

  },
  beforeDestroy() {
    if(this.player_up!==null){
      this.player_up.destroy();
      this.player_up = null;
    }
    if(this.player_down!==null){
      this.player_down.destroy();
      this.player_down = null;
    }
    if(this.player_now!==null){
      this.player_now.destroy();
      this.player_now = null;
    }
  },
  activated() {

    window.addEventListener('keydown', this.handleKeyDown);
    if(this.player_now!==null)
      this.player_now.play()
  },
  deactivated() {
    window.removeEventListener('keydown', this.handleKeyDown);
  },
  updated() {
    //this.mySwiper.updated();
  },
  async mounted() {

    this.userid = -1
    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }
    await this.initVideos()
    await this.initPlayer().then(()=>{
      this.player_now.play()
    })


  },

  methods: {
    filters: {
      formatCount(value) {
        if (value >= 10000) {
          return (value / 10000).toFixed(1) + 'w';
        }
        if (value >= 1000) {
          return (value / 1000).toFixed(1) + 'k';
        }
        return value;
      }
    },
    handleMoreButton(data){
      console.log("morebutton")
      console.log(this.videoList)
    },
    handleKeyDown(event){ //监听按键
      console.log("keybutton")
      if (event.key === ' ') {
        // 处理空格键按下事件
        if(this.player_now.paused){
          this.player_now.play()
        }
        else{
          this.player_now.pause()
        }
        // console.log(this.player_now)
        //this.player_now.play();
      }else if(event.key==='ArrowUp') {
        if(this.mySwiper!==null){
          this.mySwiper.slidePrev();
          this.mySwiper.allowSlidePrev=false;
          setTimeout(()=>{
            this.mySwiper.allowSlidePrev=true;
          },500)
        }
      }else if(event.key==='ArrowDown'){
        if(this.mySwiper!==null){
          this.mySwiper.slideNext();
          this.mySwiper.allowSlideNext=false;
          setTimeout(()=>{
            this.mySwiper.allowSlideNext=true;
          },500)
        }

      }


      else if (event.key === 'Enter') {

        console.log('Enter键被按下');
      } else if (event.key === 'Escape') {
        console.log('Esc键被按下');
      }
    },
    handleCommentButton(index){

      //let s = this.$refs.swiperSlides[index].children[2].children[0].showDialog(1);
      /*this.$refs['commentDialog'+index][0].showDialog(1)*/

      this.$refs['videoSideCard' + index][0].changeCardShow(this.videoList[index].videoId,this.videoList[index].commentCount,index);

    },
    handleLikeButton(index) {
      if (this.userid !== -1) {

        let v = this.videoList[index]

        let like = {
          userId: this.userid,
          videoId: v.videoId
        }
        axios.post('/like/likeVideo', like).then(response => {
          if (response.data.code === 1) {
            //将其设置为已喜欢
            v.isLike = true
            v.likeCount = v.likeCount + 1
            this.$set(this.videoList, index, v);
          } else {
            this.$message.error(response.data.data);

          }
        })
      } else {
        handleMainMenu.$emit('openLogView')
      }
    },
    handleUnLikeButton(index) {
      if (this.userid !== -1) {

        let v = this.videoList[index]
        let like = {
          userId: this.userid,
          videoId: v.videoId
        }
        axios.post('/like/unlikeVideo', like).then(response => {
          if (response.data.code === 1) {
            //将其设置为不喜欢
            v.isLike = false
            v.likeCount = v.likeCount - 1
            this.$set(this.videoList, index, v);
          } else {
            this.$message.error(response.data.data);


          }
        })
      } else {
        this.toLoginView();
      }
    },
    handleFollow(index) {

      if (localStorage.getItem('userInfo') !== null) {
        let v = this.videoList[index]
        let followid = v.userId

        axios.post(`/follow/${this.userid}/${followid}`)
            .then(response => {
              if (response.data.code === 1) {
                this.$message(this.userid + "已关注" + followid)

                for (let i in this.videoList) {
                  let temp = this.videoList[i]
                  if (temp.userId === followid) {

                    this.$delete(this.videoList[i], "isFollow")
                    this.$set(this.videoList[i], "isFollow", true);
                    let relation = temp.relation + 1
                    this.$delete(this.videoList[i], "relation")
                    this.$set(this.videoList[i], "relation", relation);

                  }
                }
              } else {
                this.$message.error(response.data.data);

              }

            })
      } else {
        //console.log('未登录')
        this.toLoginView();
      }

    },
    handleUnFollow(index) {
      //console.log(this.videoList[index].isFollow)

      if (localStorage.getItem('userInfo') !== null) {
        let v = this.videoList[index]

        let followid = v.userId
        axios.delete(`/follow/${this.userid}/${followid}`)
            .then(response => {
              if (response.data.code === 1) {
                this.$message(this.userid + "已取消关注" + followid)

                for (let i in this.videoList) {
                  let temp = this.videoList[i]
                  if (temp.userId === followid) {
                    this.$delete(this.videoList[i], "isFollow")
                    this.$set(this.videoList[i], "isFollow", false);
                    let relation = temp.relation - 1
                    this.$delete(this.videoList[i], "relation")
                    this.$set(this.videoList[i], "relation", relation);

                  }
                }
              } else {
                this.$message.error(response.data.data);

              }

            })
      } else {
        this.toLoginView();
      }
    },
    setCommentCount(index,count){
      this.videoList[index].commentCount=count
    },
    toUserPage(userid) {
      this.toUserView(userid)
    },
    test(a) {
      console.log('test', a)
    },
    async getUrl(path) {
      return await axios.get(`/video/getUrl/${path}`).then((response) => {
        if (response.data.code === 1) {
          //console.log('resoponse',response.data.data)
          return response.data.data.videoUrl;
        } else {
          return ''
        }
      })
    },
    async getVideo(videoId, userId) {
      return await axios.get(`/video/getVideo/${userId}/${videoId}`).then((response) => {
        if (response.data.code === 1) {
          let video = response.data.data
          video.playTime = 0;
          video.startTime = video.currentTime;
          return video
        }
      })
    },
    async setVideo(index, userid) {
      // 等待获取第一个视频的 URL
      let videoTemp = this.videoList[index]
      // console.log('change',index)
      let v = await this.getVideo(this.videoList[index].videoId, userid);
      v = {...v, ...videoTemp}
      /*      v.player = videoTemp.player
            v.id = videoTemp.id*/
      v.isFollow = v.relation !== 0
      // console.log('getvideo',v)
      this.$set(this.videoList, index, v);
    },
    saveHistory(index,player){
      if (this.userid === -1 ) {
        // 未登录用户或播放器无效，不上报
        return;
      }
      let video = this.videoList[index]
      let createTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
      let newVideo = (video.startTime===0)
      let history={
        'userId':this.userid,
        'videoId':video.videoId,
        'currentTime':video.currentTime,
        'createTime':createTime,
        'duration':player.duration,
        'newVideo': newVideo,
        'playTime': video.playTime,
        'tagId':this.tagId
      }
      axios.post('/history/create',history)
    },
    interestVideo(index,player){
      if (this.userid === -1 ) {
        // 未登录用户或播放器无效，不上报
        return;
      }
      let video = this.videoList[index]
      if(video.watchTime!==null){ //old video

        /*    let nowTime = dayjs().format('YYYY-MM-DD HH:mm:ss')

    /!*        // 初始化兴趣分
            if (!video.interestScore) video.interestScore = 0;*!/

            // 时间衰减计算（示例：λ=0.1）
            const timeDiff = dayjs(nowTime).diff(video.watchTime, 'day');
            const timeFactor = Math.exp(-0.1 * timeDiff);
            // 播放完成度
            let actionFactor = video.playTime/(player.duration-video.startTime)
            if(actionFactor>=1){
              actionFactor = 1;
            }
            // 综合兴趣分
            const newInterest = timeFactor*actionFactor;
            console.log(newInterest)*/

      }else{
        // 新视频

        /*       const playProgress = (player.currentTime - video.startTime) / player.duration;
               console.log("new",playProgress)*/
      }

    },
    newPlayer(index,VideoUrl){

      const player= new Player({
        el: this.$refs['video' + index][0],
        url: VideoUrl,
        startTime:this.videoList[index].currentTime,
        plugins: [],
        poster: '',
        width: '100%',
        height: '100%',
        autoplay: false,
        keyShortcut: false,
        //autoplayMuted: true
        /*      controls: false,  // 禁用默认控制栏
              disableControls: true  // 禁用默认控制按钮*/
      });

      player.on(Events.TIME_UPDATE,(data)=>{

      })

      player.once(Events.PLAY,(data)=>{
        //this.saveHistory(index);
      })
      player.on(Events.PLAY,(data)=>{
        this.videoList[index].currentTime=data.currentTime;
      })

      /*      player.on(Events.DESTROY,(data)=>{
              console.log(data)
              this.interestVideo(index,data);
              this.saveHistory(index);
            })*/

      player.on(Events.PAUSE,(data)=>{
        /*console.log("pause",index)*/
        this.videoList[index].playTime = this.videoList[index].playTime+(data.currentTime-this.videoList[index].currentTime);
        this.videoList[index].currentTime=data.currentTime;



      })

      player.on(Events.ENDED,(data)=>{
        if(this.page===index){
          this.player_now.play()
        }

      })
      return player;
    },
    leaveVideo(player,index){
      this.saveHistory(index,player)
    },
    async initPlayer() {
      let that = this;

      // 等待获取第一个视频的 URL
      await that.setVideo(0, this.userid)
      let firstVideoUrl = await this.getUrl(that.videoList[0].path);
      this.player_now = this.newPlayer(0,firstVideoUrl);
      if (this.videoList.length >= 2) { //只有当视频列表长度大于等于2时
        await that.setVideo(1, this.userid)
        let secondVideoUrl = await this.getUrl(that.videoList[1].path);
        this.player_down = this.newPlayer(1,secondVideoUrl);
      }else{
        this.player_down=null;
        this.player_up = null;
      }

      this.mySwiper = new Swiper('.swiper-container', { //swiper配置
        observeParents: true,
        observer: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },
        keyboard: {
          enabled: false,
          onlyInViewport: false,
        },
        allowTouchMove: true,
        // 添加以下配置
        /*    touchStartPreventDefault: false, // 不阻止默认触摸事件
            passiveListeners: false, // 不使用被动监听器
            preventClicks: false, // 不阻止点击
            preventClicksPropagation: false, // 不阻止点击传播*/
        on: {
          /*   click:function (){
               console.log("click")
             },
             touchStart:function (){
               console.log("touchstart")
             },
             touchEnd:function (){

             },*/
          slideChangeTransitionEnd: async function () {

            // 确保 videoList 已加载，并且至少有两个元素
            if (that.videoList.length <= 1) {
              console.warn('视频列表至少需要两个视频');

            }
            else {
              let now = this.activeIndex
              that.lastPage = that.page
              that.page = now
              let prev = this.previousIndex
              let next
              //将目标设置为播放状态
              that.videoList[now].player = 1

              if (now > prev) {
                //向下划
                next = now + 1;
                if (next + 2 >= that.videoList.length) {  //若视频数量不够，则拉取新视频
                  that.addNewVideos()
                  that.mySwiper.update()
                }
                that.videoList[prev].player = 0
                if (prev - 1 >= 0) {    //若存在上上个组件
                  that.videoList[prev - 1].player = -1
                }
                if (that.player_up !== null) {
                  that.player_up.destroy()
                }
                that.player_up = that.player_now
                that.player_up.pause()
                that.player_now = that.player_down

                /*     that.player_now.on(Events.PlAY, () => {
                       // TODO
                       console.log('kaishibofang')
                     })*/
                that.lastPage = that.page
                that.page = now
                that.player_now.play()

                if (next === that.videoList.length) {  //若是最后一个视频
                  console.log("最后一个视频")
                  that.player_down = null;
                } else {
                  that.videoList[next].player = 0
                  await that.setVideo(next, that.userid)
                  let newVideoUrl = await that.getUrl(that.videoList[next].path)
                  that.player_down = that.newPlayer(next,newVideoUrl);
                }
                that.leaveVideo(that.player_up,prev)
              } else if (now < prev) {
                //向上划
                next = now - 1;
                /*              // 检查 next 是否在 videoList 的范围内
                              if (next < 0) {
                                console.warn('没有上一个视频可播放');
                                return; // 如果没有上一个视频，直接返回
                              }*/
                that.videoList[prev].player = 0;
                if (prev + 1 < that.videoList.length) { //若存在上上个组件
                  that.videoList[prev + 1].player = -1;
                }
                if (that.player_down !== null) {
                  that.player_down.destroy()
                }
                that.player_down = that.player_now
                that.player_down.pause()
                that.player_now = that.player_up

                /*
                                that.player_now.on(Events.PlAY, () => {
                                  // TODO
                                  console.log('kaishibofang')
                                })*/

                that.player_now.play()

                if (next >= 0) {
                  that.videoList[next].player = 0;
                  await that.setVideo(next, that.userid)
                  let newVideoUrl = await that.getUrl(that.videoList[next].path)
                  that.player_up = that.newPlayer(next,newVideoUrl)
                } else {
                  that.player_up = null;
                }

                that.leaveVideo(that.player_down,prev)
              }



            }

            // 监听播放器事件
            // this.setupPlayerEvents(this.player_now);
          },

        },
        direction: 'vertical'
      })
      // ✨ 修改点: 如果只有一个视频，禁用Swiper的滑动
      if (this.videoList.length <= 1) {
        if (this.mySwiper) {
          this.mySwiper.allowSlideNext = false;
          this.mySwiper.allowSlidePrev = false;
        }
      } else {
        // 如果后续视频数量增加了，确保滑动是启用的
        if (this.mySwiper) {
          this.mySwiper.allowSlideNext = true;
          this.mySwiper.allowSlidePrev = true;
        }
      }

      // ✨ 确保 player_now 播放 (如果它存在)
      if (this.player_now) {
        this.player_now.play();
      }
    },
    setupPlayerEvents(player) {
      if (!player) return;

      player.on('play', () => {
        this.isPlaying = true;
        this.hideControlsWithDelay();
      });

      player.on('pause', () => {
        this.isPlaying = false;
        this.controlsVisible = true;
      });

      player.on('timeupdate', () => {
        this.currentTime = player.currentTime || 0;
      });

      player.on('durationchange', () => {
        this.duration = player.duration || 100;
      });

      player.on('ended', () => {
        this.isPlaying = false;
        this.controlsVisible = true;
      });
    },

    async initVideos() {
      if (this.isLoadingInitial) return;
      this.isLoadingInitial = true;
      try {
        const result = await this.loadInitialVideosFunction(); // 调用prop函数
        if (result && Array.isArray(result)) {
          let videos = result
          for (let i = 0; i < videos.length; i++) {
            videos[i].player = -1
            videos[i].id = i;

            //videos[i].playTime=0;
            if(i===0){
              videos[0].player = 1
            }
            if(i===1){
              videos[1].player = 0
            }
          }
          this.videoList = videos
          /*console.log("PlayerView videoList updated:", this.videoList);*/
          /*  resolve(result); // 成功时解决 Promise*/
        } else {
          console.error("Received invalid data for videoList:", result);
          this.videoList = [];
        }
      } catch (error) {
        console.error("Error processing received video data:", error);
        this.videoList = [];
      } finally {
        this.isLoadingInitial = false;
      }

    },

    async addNewVideos() { //拉取新视频
      if (this.isLoadingMore) return;
      this.isLoadingMore = true;
      try {
        const result = await this.loadMoreVideosFunction(this.videoList.length);
        if (result && Array.isArray(result)) {
          let videos = result
          if (videos.length !== 0) {
            for (let i = 0; i < videos.length; i++) {
              videos[i].player = -1
              videos[i].id = i + length;
            }
            this.videoList = this.videoList.concat(result);
          }
        } else {
          console.error("Received invalid data for videoList:", result);
        }
      } catch (error) {
        console.error("Error processing received video data:", error);
      } finally {
        this.isLoadingMore = false;
      }



    }
  }
}
</script>




