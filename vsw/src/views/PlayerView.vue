<template>
  <div style="height: 100%">
    <div class="swiper-container">
      <div class="swiper-wrapper">
        <div class="swiper-slide">Slide 1</div>
        <div class="swiper-slide">Slide 2</div>
        <div class="swiper-slide">Slide 3</div>
      </div>
<!--       如果需要分页器
      <div class="swiper-pagination"></div>-->
<!--
      &lt;!&ndash; 如果需要导航按钮 &ndash;&gt;


      &lt;!&ndash; 如果需要滚动条  &ndash;&gt;
      <div class="swiper-scrollbar"></div>-->

    </div>

  </div>

</template>


<script >
import  Swiper from 'swiper';
import 'swiper/css/swiper.min.css';

import Player from 'xgplayer';
import 'xgplayer/dist/index.min.css';
  export default {
    data(){
        return {
          videoList:[
            {
              id:0,
              url:'//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',

            },
            {
              id:1,
              url:'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218114723HDu3hhxqIT.mp4'
            },
            {
              id:2,
              url:'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218093206z8V1JuPlpe.mp4'
            },
            {
              id:3,
              url:'https://stream7.iqilu.com/10339/article/202002/18/2fca1c77730e54c7b500573c2437003f.mp4'
            }

          ],
          page: 1,

        }
    },

    mounted() {
      let mySwiper = new Swiper('.swiper-container',{ //swiper配置
          navigation:{
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
          },
          direction:'vertical'
      })
      let player1 = new Player({
        id:'player1',
        url: '',
        plugins:[],
        poster:'',
        width: '100%',
        height: '300px'
      });
      let player2 = new Player({
        id:'player2',
        url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
        plugins:[],
        poster:'',
        width: '100%',
        height: '300px'
      });
      let player3 = new Player({
        id:'player3',
        url: '//sf1-cdn-tos.huoshanstatic.com/obj/media-fe/xgplayer_doc_video/mp4/xgplayer-demo-360p.mp4',
        plugins:[],
        poster:'',
        width: '100%',
        height: '300px'
      });
    },
    methods:{
      createFirstVideo(){ //生成第一个组件

      },
      createNewVideo(){ //生成新组件

      },
      nextVideo(){    //到下一个视频

      },
      prevVideo(){    //到上一个视频
          //若不为初始组件时
          //1.播放上一个视频 2.将上上个视频移入播放容器 3.删除下一个视频的播放容器
      },
      startPlay(data,index){ //播放视频

      },
      pausePlay(data,index){ //暂停视频

      }
    }
  }
</script>


<style scoped lang="stylus">
.swiper-container{
  width:100%;
  height:100%
}
</style>