<script >
import PlayerView from "@/views/PlayerView.vue";
import Middle from '@/utils/RecommendVIewToPlayerView.js';
import axios from "axios";
export default {
  components: {PlayerView},
  data(){
    return{
      userid:-1
    }
  },
  methods:{
    LoadInitVideos() {
      return  axios.get(`/video/getRecVideoList/${this.userid}/10`).then((response) => {
       let videos = response.data.data
        return videos
      }).catch(error=>{
        console.error("Error fetching videos in LoadInitVideos:", error);
        return []; // 或者 throw error;
      })
    },

    LoadNewVideo(length){
      return axios.get(`/video/getRecVideoList/${this.userid}/2`).then((response)=>{
        let videos = response.data.data
        return videos

      }).catch(error=>{
        console.error("Error fetching videos in LoadNewVideos:", error);
        return []; // 或者 throw error;
      })
    }
  },
  created(){
    let _this = this
    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }

    Middle.$on('getInitVideos', async (callback) => {
      //第一次挂载时拉取videolist

      const videosData = await _this.LoadInitVideos();

      callback(videosData);

    })
  },

  mounted() {
    let _this = this
    Middle.$on('getNewVideo',async (length,callback)=>{
      const newVideo = await _this.LoadNewVideo(length);
      callback(newVideo);

    })

    this.$refs.playerView.setParent(Middle)

  }
}
</script>

<template>
  <PlayerView ref="playerView" ></PlayerView>
</template>




<style scoped lang="stylus">

</style>