<script >
import PlayerView from "@/views/Recommend/PlayerView.vue";
import Middle from '@/utils/RecommendVIewToPlayerView.js';
import axios from "axios";
export default {
  components: {PlayerView},
  data(){
    return{
      userid:''
    }
  },
  methods:{
    LoadInitVideos() {

        /*    {
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
            }*/
      return  axios.get(`/video/getRecVideoList/${this.userid}/5`).then((response) => {
       let videos = response.data.data
        for (let i = 0; i < videos.length; i++) {
          videos[i].player = -1
          videos[i].id = i;
        }
        videos[0].player = 1
        videos[1].player = 0
        return videos
      }).catch(error=>{
        console.error("Error fetching videos in LoadInitVideos:", error);
        return []; // 或者 throw error;
      })


    },

    LoadNewVideo(length){

      return axios.get(`/video/getRecVideoList/${this.userid}/1`).then((response)=>{
        let videos = response.data.data
        for (let i = 0; i < videos.length; i++) {
          videos[i].player = -1
          videos[i].id = i+length;
        }
        return videos
      }).catch(error=>{
        console.error("Error fetching videos in LoadNewVideos:", error);
        return []; // 或者 throw error;
      })
    }
  },
  created(){
    let _this = this
    let userid = -1
    if (localStorage.getItem('userInfo') !== null) {
      userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }
    this.userid = userid
    Middle.$on('getInitVideos', async (callback) => {
      //第一次挂载时拉取videolist
      const videosData = await _this.LoadInitVideos();
      //console.log("1")
      callback(videosData);

    })
  },

  mounted() {

    let _this = this
    Middle.$on('getNewVideo',async (length,callback)=>{
      const newVideo = await _this.LoadNewVideo(length);
      callback(newVideo);

    })



  }
}
</script>

<template>
  <PlayerView></PlayerView>
</template>




<style scoped lang="stylus">

</style>