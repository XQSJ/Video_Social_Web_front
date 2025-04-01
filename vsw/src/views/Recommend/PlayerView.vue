<template>
  <div style="height: 100%">

    <div class="swiper-container">
      <div class="swiper-wrapper" ref="mySwiper" >
        <div class="swiper-slide" v-for="(item,index) in videoList" :key="index" ref="swiperSlides">
          <div :ref="`video${index}`" class="video-container">
              <div>
              </div>
          </div>
          <div class="control-buttons">
            <el-button @click="toUserPage(item.userid)">
              头像
            </el-button>

            <el-button @click="handleFollow(item.userid)" v-if="!item.isFollow">
              关注
            </el-button>
            <el-button @click="handleUnFollow(item.userid)" v-if="item.isFollow">
              已关注
            </el-button>
            <el-button>
              {{item.userid}}
            </el-button>
            <el-button @click="test(666)">
              点赞
            </el-button>
            <el-button>
              评论
            </el-button>
            <el-button>
              收藏
            </el-button>
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
import Follow from '@/utils/follow'
export default {
  data() {
    return {
      videoList: [],
      page: 0,
      players:[],
      mySwiper:{},

    }
  },
  watch:{


  },
  beforeRouteEnter(){

  },
  created(){



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
    await this.initVideos()
    await this.initPlayer()



  },
  methods: {
    async isFollow(followid) {
        let userid = JSON.parse(localStorage.getItem('userInfo')).userId
      return  await axios.get(`/follow/${userid}/${followid}`)
            .then((response) => {
              this.isFollower = response.data.data
              return response.data.data
            })
    },
    handleFollow(followid){
      Follow.$emit('follow',followid)
    },
    handleUnFollow(followid) {
      Follow.$emit('unfollow',followid)
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
    toUserPage(userid){
      this.toUserView(userid)
    },
    test(a){
      console.log('test',a)
    },
    async getUrl(videoId){
      return await axios.get(`/video/getUrl/${videoId}`).then((response)=>{
        if(response.data.code===1){
          //console.log('resoponse',response.data.data)
          return response.data.data.videoUrl;
        }else{
          return ''
        }
      })
    },
    async initPlayer(){
      let that = this;
     // console.log("videoList",this.videoList)
      // 等待获取第一个视频的 URL
      let firstVideoUrl = await this.getUrl(that.videoList[0].videoId);
      let secondVideoUrl = await this.getUrl(this.videoList[1].videoId);

      this.player_now=new Player({
        el:this.$refs['video'+0][0],
        url: firstVideoUrl,
        plugins: [],
        poster: '',
        width: '100%',
        height: '100%',
        autoplay:false,
        /*      controls: false,  // 禁用默认控制栏
              disableControls: true  // 禁用默认控制按钮*/
      });
      this.player_down=new Player({
        el:this.$refs['video'+1][0],
        url: secondVideoUrl,
        plugins: [],
        poster: '',
        width: '100%',
        height: '100%',
        autoplay:false,
        /*      controls: false,  // 禁用默认控制栏
              disableControls: true  // 禁用默认控制按钮*/
      });
      this.mySwiper = new Swiper('.swiper-container', { //swiper配置
        observeParents:true,
        observer:true,
        navigation: {
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        },

        allowTouchMove:true,
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
          slideChangeTransitionEnd: async function (){

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


              if (typeof (that.player_up) !== 'undefined') {
                that.player_up.destroy()
              }
              that.player_up = that.player_now
              that.player_up.pause()
              that.player_now = that.player_down
              that.player_now.play()
              let newVideoUrl     //let newVideoUrl = await that.getUrl(that.videoList[next].videoId);
             // let url = 'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218093206z8V1JuPlpe.mp4'
              newVideoUrl = await that.getUrl(that.videoList[next].videoId)
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
                newVideoUrl = await that.getUrl(that.videoList[next].videoId)
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
    initVideos(){ //初始化视频列表

      Middle.$emit('getInitVideos', async (result) => {

        //console.log("result:",result)
        this.videoList = result
        //console.log("r",this.videoList)
        for (let v of this.videoList) {
          if (localStorage.getItem('userInfo') !== null) {
            v.isFollow = await this.isFollow(v.userid)
          }else{
            v.isFollow = false
          }
          console.log("outresult",v.isFollow)
        }
      })


    },
    addNewVideos(){ //拉取新视频
      let newVideo = {}
      //1.拉取
      Middle.$emit('getNewVideo',this.videoList.length,async (result) => {

        newVideo = result
        newVideo.player = -1
        newVideo.id = this.videoList.length
       // newVideo.isFollow = await this.isFollow(this.videoList.userid)
        console.log(newVideo.isFollow)
      })
      //2.放入视频列表

      this.videoList.push(newVideo)
    }
  }
}
</script>




