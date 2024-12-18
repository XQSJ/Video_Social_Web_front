<template>
  <div style="height: 100%">
    <div class="swiper-container">
      <div class="swiper-wrapper" ref="mySwiper">
        <div class="swiper-slide" v-for="(item,index) in videoList" :key="index" ref="swiperSlides">

<!--          <div v-if="item.player>=0" ref="playing">


            <div v-if="item.player===1" ref="isPlaying" id="player2" >
              开始播放
            </div>
            有播放器{{item.id}}
          </div>-->
          <div :ref="`video${index}`"></div>
        </div>

      </div>


    </div>

  </div>

</template>


<script>
import Swiper from 'swiper';
import 'swiper/css/swiper.min.css';

import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';

export default {
  data() {
    return {
      videoList: [
        {
          id: 0,
          player: 1,
          url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',

        },
        {
          id: 1,
          player: 0,
          url: 'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218114723HDu3hhxqIT.mp4'
        },
        {
          id: 2,
          player: -1,
          url: 'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218093206z8V1JuPlpe.mp4'
        },
        {
          id: 3,
          player: -1,
          url: 'https://stream7.iqilu.com/10339/article/202002/18/2fca1c77730e54c7b500573c2437003f.mp4'
        }

      ],
      page: 0,
      player:{},
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
  mounted() {
    let that = this;
    that.mySwiper = new Swiper('.swiper-container', { //swiper配置
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      allowTouchMove:true,
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

          //console.log(this.slides);
          //console.log(this.slides.eq(3).index());
          //console.log(this.params)
          //console.log(this.slides[this.activeIndex]);


          //console.log(this.activeIndex)
          //that.videoList[this.activeIndex].player=1
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

          }
          else if(this.activeIndex<this.previousIndex){
            //向上划

            next = this.activeIndex-1;

            that.videoList[prev].player=0;
            that.videoList[prev+1].player=-1;
            if(next>=0){
              that.videoList[next].player=0;
            }


          }
          that.player.destroy()
          that.player=new Player({
            el:that.$refs['video'+now][0],
            url: that.videoList[now].url,
            plugins: [],
            poster: '',
            width: '100%',
            height: '100%',
            autoplay: true
          });
          //that.player.play()
          //console.log(this.slides[this.activeIndex])

          /*console.clear()
          for (let i in that.videoList){
              //console.log(that.videoList[i].id)
              console.log(that.videoList[i].player)

          }*/
          //console.log(this.slides)
        }
      },
      direction: 'vertical'
    })
    that.player=new Player({
      el:this.$refs['video'+0][0],
      url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
      plugins: [],
      poster: '',
      width: '100%',
      height: '100%',
      autoplay:true
    });
/*    let player1 = new Player({
      id: 'player1',
      url: '',
      plugins: [],
      poster: '',
      width: '100%',
      height: '300px'
    });

    let player3 = new Player({
      id: 'player3',
      url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
      plugins: [],
      poster: '',
      width: '100%',
      height: '300px'
    });*/
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
    addNewVideos(){ //拉取新视频
      //1.拉取
      //2.放入视频列表
      var newVideo = {
        id:this.videoList.length,
        player: -1,
        url: 'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218093206z8V1JuPlpe.mp4'
      }
      this.videoList.push(newVideo)
    }
  }
}
</script>


<style scoped lang="stylus">
.swiper-container {
  width: 100%;
  height: 100%
}
</style>