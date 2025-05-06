<template>
  <div style="height: 100%">

    <div class="swiper-container">
      <div class="swiper-wrapper" ref="mySwiper">
        <div class="swiper-slide" v-for="(item,index) in videoList" :key="index" ref="swiperSlides">
          <div :ref="`video${index}`" class="video-container" v-if="item.player!==-1">
            <div>
            </div>
          </div>

<!--          <videoView :ref="`videoView${index}`" v-if="item.player!==-1"></videoView>-->
          <div class="video-description" v-if="item.player!==-1">
            {{ item.title }}
            {{ item.description }}
          </div>
          <div class="control-buttons" v-if="item.player!==-1">

            <el-button @click="toUserPage(item.userId)">
              <el-avatar :size="60"
                         :src=" item.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
              <!--
                            -->
              <br>
              {{ item.userId }}
            </el-button>


            <div v-show="item.relation!==-1">
              <el-button @click="handleFollow(index)" v-show="item.isFollow===false">
                关注
              </el-button>
              <el-button @click="handleUnFollow(index)" v-show="item.isFollow===true">
                取消关注
              </el-button>
            </div>


            <el-button @click="handleLike(index)" v-show="item.isLike===false">
              点赞
              <br>{{ item.likeCount }}
            </el-button>
            <el-button @click="handleUnLike(index)" v-show="item.isLike===true">
              取消点赞<br>
              {{ item.likeCount }}
            </el-button>
            <el-button @click="test(index)">
              评论
            </el-button>
            <!--            <el-button>
                          收藏
                        </el-button>-->
            <el-button @click="test(videoList)">
              更多
            </el-button>
          </div>
        </div>

      </div>


    </div>
    <!--    <div>
          <el-button>
            up
          </el-button>
          <el-button>
            down
          </el-button>
        </div>-->

  </div>

</template>
<style scoped lang="stylus">
.swiper-container {
  width: 100%;
  height: 100%

}

.video-description {
  position: absolute;
  z-index: 100; /* 确保高于播放器 */
  bottom: 20px; /* 距离底部20px */
  align-items: flex-start; /* 左对齐 */
  color: white
}

/* 添加以下样式 */
.control-buttons {
  position: absolute;
  z-index: 100; /* 确保高于播放器 */
  bottom: 20px; /* 距离底部20px */
  right: 20px; /* 距离右侧20px */
  display: flex;
  flex-direction: column; /* 竖向排列 */
  align-items: flex-end; /* 右对齐 */
  pointer-events: auto !important; /* 强制启用点击事件 */
}

.control-buttons .el-button {
  margin: 5px 0; /* 设置上下间距 */
  pointer-events: auto !important; /* 确保按钮可点击 */
}
</style>

<script>
import Swiper from 'swiper';
import 'swiper/css/swiper.min.css';

import Player, {Events} from 'xgplayer';

import 'xgplayer/dist/index.min.css';
import Middle from '@/utils/RecommendVIewToPlayerView.js';
import axios from "axios";
import dayjs from "dayjs";

export default {

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
      player_now: null
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
    /*   isSelf(userid) {
         if (localStorage.getItem('userInfo') !== null) {

           if (userid === JSON.parse(localStorage.getItem('userInfo')).userId) {
             return true
           } else {
             return false
           }
         } else {
           return false;
         }
       },*/
    async checkFollow(followid) {

      return await axios.get(`/follow/${this.userid}/${followid}`)
          .then((response) => {
            let result = response.data.data
            if (!result)
              return false
            return true
          }).catch((error) => {
            return false
          })
    },

    handleKeyDown(event){ //监听按键

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
    handleLike(index) {
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
        this.toLoginView();
      }
    },
    handleUnLike(index) {
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
    createFirstVideo() { //生成第一个组件

    },
    createNewVideo() { //生成新组件

    },
    nextVideo() {    //到下一个视频

    },
    prevVideo() {    //到上一个视频
      //若不为初始组件时
      //1.播放上一个视频 2.将上上个视频移入播放容器 3.删除下一个视频的播放容器
    },
    startPlay(data, index) { //播放视频

    },
    pausePlay(data, index) { //暂停视频

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
      let interest = video.currentTime/player.duration
      let history={
        'userId':this.userid,
        'videoId':video.videoId,
        'currentTime':video.currentTime,
        'createTime':createTime,
        'interest':interest
      }
      if(video.startTime===0){
        let interest = video.currentTime/player.duration
        history.interest = interest
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
            if (that.videoList.length === 1) {
              console.warn('视频列表至少需要两个视频');

            } else {
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

    initVideos() {
      return new Promise((resolve, reject) => {
        Middle.$emit('getInitVideos', (result) => {
          try {
            if (result && Array.isArray(result)) {
              let videos = result
              for (let i = 0; i < videos.length; i++) {
                videos[i].player = -1
                videos[i].id = i;

                //videos[i].playTime=0;
              }
              videos[0].player = 1
              videos[1].player = 0
              this.videoList = videos
              console.log("PlayerView videoList updated:", this.videoList);
              resolve(result); // 成功时解决 Promise
            } else {
              console.error("Received invalid data for videoList:", result);
              this.videoList = [];
              reject(new Error("Received invalid data")); // 失败时拒绝 Promise
            }
          } catch (error) {
            console.error("Error processing received video data:", error);
            reject(error);
          }
        });
      });
    },
    addNewVideos() { //拉取新视频
      return new Promise((resolve, reject) => {
        //1.拉取
        Middle.$emit('getNewVideo', this.videoList.length, (result) => {
          try {
            if (result && Array.isArray(result)) {
              let videos = result
              if (videos.length !== 0) {
                for (let i = 0; i < videos.length; i++) {
                  videos[i].player = -1
                  videos[i].id = i + length;
                }
                this.videoList = this.videoList.concat(result);
              }
              //this.videoList.push(result)
              //console.log("PlayerView videoList updated:", this.videoList);
              resolve(result); // 成功时解决 Promise
            } else {
              console.error("Received invalid data for videoList:", result);
              this.videoList = [];
              reject(new Error("Received invalid data")); // 失败时拒绝 Promise
            }
          } catch (error) {
            console.error("Error processing received video data:", error);
            reject(error);
          }


        })


      })

    }
  }
}
</script>




