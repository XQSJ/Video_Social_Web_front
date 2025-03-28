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
            <el-button>
              关注
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
            <el-button>
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
export default {
  data() {
    return {
      videoList: [],
      page: 0,
     /* player_now:'',
      player_prev:'',
      player_next:'',*/
      players:[],
      mySwiper:{}
    }
  },
  watch:{

    page(newValue,oldValue){
      //this.$refs.isPlaying[0].setAttribute("id","player2")
      console.log(this.$refs.isPlaying[0])
      console.log(this.$refs.isPlaying)


      //console.log(this.$refs.playing.id='player1')
    }
  },
  beforeRouteEnter(){

  },
  created(){

    this.initVideos()

  },
  destroyed() {

  },
  activated() {
    this.player_now.play()
  },
  deactivated() {

  },
  updated() {
    //this.mySwiper.updated();
  },
  mounted() {

    this.initPlayer()



  },
  methods: {
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
      console.log('test'+a)
    },
    initPlayer(){
      let that = this;
      this.player_now=new Player({
        el:this.$refs['video'+0][0],
        url: this.videoList[0].url,
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
        url: this.videoList[1].url,
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
          slideChangeTransitionEnd: function (){

            let now = this.activeIndex
            let prev = this.previousIndex
            let next

            //将目标设置为播放状态
            that.videoList[now].player=1
            that.page = now
            if(now>prev){
              //向下划


              next = this.activeIndex+1;
              if(next+2>=that.videoList.length){  //若视频数量不够，则拉取新视频
                that.addNewVideos()
                that.mySwiper.update()
              }

              that.videoList[prev].player=0
              if(prev-1>=0){    //若存在上上个组件
                that.videoList[prev-1].player=-1
              }
              that.videoList[next].player=0


              if(typeof(that.player_up) !== 'undefined'){
                that.player_up.destroy()
              }
              that.player_up=that.player_now
              that.player_up.pause()
              that.player_now=that.player_down
              that.player_now.play()
              that.player_down=new Player({
                el:that.$refs['video'+next][0],
                url: that.videoList[next].url,
                plugins: [],
                poster: '',
                width: '100%',
                height: '100%',
                autoplay: false,
                controls: false,  // 禁用默认控制栏
                disableControls: true  // 禁用默认控制按钮
              });

            }
            else if(this.activeIndex<this.previousIndex){
              //向上划

              next = this.activeIndex-1;

              that.videoList[prev].player=0;
              that.videoList[prev+1].player=-1;
              if(next>=0){
                that.videoList[next].player=0;
              }


              if(typeof(that.player_down) !== 'undefined'){
                that.player_down.destroy()
              }
              that.player_down=that.player_now
              that.player_down.pause()
              that.player_now=that.player_up
              that.player_now.play()

              if(next>=0){
                that.player_up=new Player({
                  el:that.$refs['video'+next][0],
                  url: that.videoList[next].url,
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
       let videos =[]
        Middle.$emit('getInitVideos',(result)=>{

          videos=result
        })
      this.videoList = videos

    },
    addNewVideos(){ //拉取新视频
      let newVideo = {
        id:this.videoList.length,
        player: -1,
        url: '',
        userid:''
      }
      //1.拉取
      Middle.$emit('getNewVideo',this.videoList.length,(result)=>{

        newVideo.url = result.url
        newVideo.userid=result.userid
      }) //？？？传参应为id
      //2.放入视频列表

      this.videoList.push(newVideo)
    }
  }
}
</script>




