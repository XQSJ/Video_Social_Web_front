<template>
  <div style="height: 100%">

    <div class="swiper-container">
      <div class="swiper-wrapper" ref="mySwiper">
        <div class="swiper-slide" v-for="(item,index) in videoList" :key="index" ref="swiperSlides">
          <div :ref="`video${index}`" class="video-container">
            <div>
            </div>
          </div>
          <div class="video-description">
            {{item.title}}
            {{item.description}}
          </div>
          <div class="control-buttons">

            <el-button @click="toUserPage(item.userId)">
              <el-avatar :size="60" :src=" item.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
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
              <br>{{item.likeCount}}
            </el-button>
            <el-button @click="handleUnLike(index)" v-show="item.isLike===true">
              取消点赞<br>
              {{item.likeCount}}
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
.video-description{
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

import Player from 'xgplayer';

import 'xgplayer/dist/index.min.css';
import Middle from '@/utils/RecommendVIewToPlayerView.js';
import axios from "axios";

export default {
  data() {
    return {
      videoList: [],
      page: 0,
      players: [],
      mySwiper: {},
      userid:'',
    }
  },
  watch: {},
  beforeRouteEnter() {

  },
  created() {


  },
  destroyed() {

  },
  activated() {
    //this.player_now.play()
  },
  deactivated() {

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
     await this.initPlayer()


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
    handleLike(index){
      if (this.userid!==-1) {

        let v = this.videoList[index]

        let like = {
            userId:this.userid,
            videoId:v.videoId
        }
        axios.post('/like/likeVideo',like).then(response=>{
          if (response.data.code === 1) {
            //将其设置为已喜欢
            v.isLike = true
            v.likeCount = v.likeCount + 1
            this.$set(this.videoList, index, v);
          }else{
            this.$message.error(response.data.data);

          }
        })
      }else{
        this.toLoginView();
      }
    },
    handleUnLike(index){
      if (this.userid!==-1) {

        let v = this.videoList[index]
        let like = {
          userId:this.userid,
          videoId:v.videoId
        }
        axios.post('/like/unlikeVideo',like).then(response=>{
          if (response.data.code === 1) {
            //将其设置为不喜欢
            v.isLike = false
            v.likeCount = v.likeCount - 1
            this.$set(this.videoList, index, v);
          }else{
            this.$message.error(response.data.data);

          }
        })
      }else{
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

                for(let i in this.videoList){
                  let temp = this.videoList[i]
                  if(temp.userId === followid){

                    this.$delete(this.videoList[i], "isFollow")
                    this.$set(this.videoList[i], "isFollow", true);
                    let relation= temp.relation+1
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

                for(let i in this.videoList){
                  let temp = this.videoList[i]
                  if(temp.userId === followid){
                    this.$delete(this.videoList[i], "isFollow")
                    this.$set(this.videoList[i], "isFollow", false);
                    let relation= temp.relation-1
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
    async getUrl(videoId) {
      return await axios.get(`/video/getUrl/${videoId}`).then((response) => {
        if (response.data.code === 1) {
          //console.log('resoponse',response.data.data)
          return response.data.data.videoUrl;
        } else {
          return ''
        }
      })
    },
    async getVideo(videoId,userId){
      return await axios.get(`/video/getVideo/${userId}/${videoId}`).then((response)=>{
         if(response.data.code === 1) {
           let video = response.data.data
           return video
         }
      })
    },
    async setVideo(index, userid) {
      // 等待获取第一个视频的 URL
      let videoTemp = this.videoList[index]
     // console.log('change',index)
      let v = await this.getVideo(this.videoList[index].videoId, userid);
      v = {...v,...videoTemp}
/*      v.player = videoTemp.player
      v.id = videoTemp.id*/
      v.isFollow =v.relation !== 0
     // console.log('getvideo',v)
      this.$set(this.videoList, index, v);
    },
    async initPlayer() {
      let that = this;


        // 等待获取第一个视频的 URL
        await that.setVideo(0, this.userid)
        await that.setVideo(1, this.userid)

      let firstVideoUrl = await this.getUrl(that.videoList[0].path);
      let secondVideoUrl = await this.getUrl(that.videoList[1].path);

      this.player_now = new Player({
        el: this.$refs['video' + 0][0],
        url: firstVideoUrl,
        plugins: [],
        poster: '',
        width: '100%',
        height: '100%',
        autoplay: false,
        /*      controls: false,  // 禁用默认控制栏
              disableControls: true  // 禁用默认控制按钮*/
      });
      this.player_down = new Player({
        el: this.$refs['video' + 1][0],
        url: secondVideoUrl,
        plugins: [],
        poster: '',
        width: '100%',
        height: '100%',
        autoplay: false,
        /*      controls: false,  // 禁用默认控制栏
              disableControls: true  // 禁用默认控制按钮*/
      });
      this.mySwiper = new Swiper('.swiper-container', { //swiper配置
        observeParents: true,
        observer: true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
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

            let now = this.activeIndex
            let prev = this.previousIndex
            let next

            /*            // 确保 videoList 已加载，并且至少有两个元素
                        if (that.videoList.length < 2) {
                          console.warn('视频列表至少需要两个视频');
                          return; // 如果视频数量不足，直接返回
                        }*/
            //将目标设置为播放状态
            that.videoList[now].player = 1
            that.page = now
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
              that.videoList[next].player = 0
              await that.setVideo(next, that.userid)

              if (typeof (that.player_up) !== 'undefined') {
                that.player_up.destroy()
              }
              that.player_up = that.player_now
              that.player_up.pause()
              that.player_now = that.player_down
              that.player_now.play()
              let newVideoUrl     //let newVideoUrl = await that.getUrl(that.videoList[next].videoId);
              // let url = 'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218093206z8V1JuPlpe.mp4'
              newVideoUrl = await that.getUrl(that.videoList[next].path)
              that.player_down = new Player({
                el: that.$refs['video' + next][0],
                url: newVideoUrl,
                plugins: [],
                poster: '',
                width: '100%',
                height: '100%',
                autoplay: false,
                controls: false,  // 禁用默认控制栏
                disableControls: true  // 禁用默认控制按钮
              });

            } else if (now < prev) {
              //向上划

              next = now - 1;

              /*              // 检查 next 是否在 videoList 的范围内
                            if (next < 0) {
                              console.warn('没有上一个视频可播放');
                              return; // 如果没有上一个视频，直接返回
                            }*/
              that.videoList[prev].player = 0;


              that.videoList[prev + 1].player = -1;
              if (next >= 0) {
                that.videoList[next].player = 0;
                await that.setVideo(next, that.userid)
              }


              if (typeof (that.player_down) !== 'undefined') {
                that.player_down.destroy()
              }
              that.player_down = that.player_now
              that.player_down.pause()
              that.player_now = that.player_up
              that.player_now.play()

              if (next >= 0) {
                let newVideoUrl
                newVideoUrl = await that.getUrl(that.videoList[next].path)
                that.player_up = new Player({
                  el: that.$refs['video' + next][0],
                  url: newVideoUrl,
                  plugins: [],
                  poster: '',
                  width: '100%',
                  height: '100%',
                  autoplay: false,
                  /*      controls: false,  // 禁用默认控制栏
                        disableControls: true  // 禁用默认控制按钮*/
                })
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

              this.videoList=result
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

              this.videoList= this.videoList.concat(result);
              //this.videoList.push(result)
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


        })


      })

    }
  }
}
</script>




