<script >
import PlayerView from "@/views/PlayerView.vue";
import Middle from '@/utils/RecommendVIewToPlayerView.js';
export default {
  components: {PlayerView},
  data(){
    return{

    }
  },
  methods:{
    LoadInitVideos(){
        let videos = [{
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
          }]

        return  videos

    },
    LoadNewVideo(length){
      //加载新视频

      //将数据写入
      let newVideo;

      return newVideo = {
        id:length,
        url: 'https://stream7.iqilu.com/10339/upload_transcode/202002/18/20200218093206z8V1JuPlpe.mp4'
      }
    }
  },
  created(){
    let _this = this
    Middle.$on('getInitVideos',(callback)=>{
      callback(_this.LoadInitVideos());
    })
  },

  mounted() {

    let _this = this
    Middle.$on('getNewVideo',(length,callback)=>{

      callback(_this.LoadNewVideo(length));

    })

    //第一次挂载时拉取videolist
    console.log(111)

  }
}
</script>

<template>
  <PlayerView></PlayerView>
</template>




<style scoped lang="stylus">

</style>