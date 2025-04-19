<script >
import PlayerView from "@/views/Recommend/PlayerView.vue";
import Middle from '@/utils/RecommendVIewToPlayerView.js';
import axios from "axios";
export default {
  components: {PlayerView},
  data(){
    return{

    }
  },
  methods:{
    LoadInitVideos(){
     // console.log("2")
      /*axios.get().then((response)=>{

      });*/
      let videos = [
        {
          id: 0,
          player: 1,
          videoId: '80e48b690f6371f0bfbd6723a78f0102',
          userid: 3
        },
        {
          id: 1,
          player: 0,
          videoId: '0090e9530f6371f0bff44531959d0102',
          userid: 4
        },
        {
          id: 2,
          player: -1,
          videoId: '6054cf210f6371f080484531859c0102',
          userid: 4
        },
        {
          id: 3,
          player: -1,
          videoId: '007faa1c0f6371f0bfb05107e0c90102',
          userid: 3
        }
      ];
/*      // 循环获取每个视频的URL
      for (let i = 0; i < videos.length; i++) {
        try {
          const url = await this.getUrl(videos[i].videoId);
          videos[i].url = url || ''; // 如果url为null，设置为空字符串
        } catch (error) {
          console.error(`获取视频${videos[i].videoId}的URL失败:`, error);
          videos[i].url = ''; // 出错时设置为空字符串
        }
      }*/
      //console.log("videos:",videos)
      return  videos

    },

    LoadNewVideo(length){
      //加载新视频

      //将数据写入
      let newVideo;

      return newVideo = {
        id:length,
        userid:4,
        videoId:'80e48b690f6371f0bfbd6723a78f0102'
      }
    }
  },
  created(){
    let _this = this
    Middle.$on('getInitVideos', (callback)=>{
      //第一次挂载时拉取videolist
      //console.log("拉取videolist")
      //console.log("1")
       callback(_this.LoadInitVideos());
      //console.log("3")
    })
  },

  mounted() {

    let _this = this
    Middle.$on('getNewVideo',(length,callback)=>{

      callback(_this.LoadNewVideo(length));

    })



  }
}
</script>

<template>
  <PlayerView></PlayerView>
</template>




<style scoped lang="stylus">

</style>