<script >

import PlayerView from "@/views/UserPlayerView.vue";
import axios from "axios";
import GetUserViewVideo from "@/utils/GetUserViewVideo";

export default {
  components: {PlayerView},
  name:'UserVideoPlayerDialog',
  data(){
    return{
      dialogFormVisible: false,
      videoId:null,
    }
  },
  methods:{
    closeDialog(){
        this.dialogFormVisible = false;
    },
    showDialog(videoId){
      console.log("showUservideo:",videoId)
      this.videoId=videoId
       this.dialogFormVisible = true;
    },
    LoadInitVideos() {
        let videos = [
          {"videoId": this.videoId}
        ]

        return videos
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

    GetUserViewVideo.$on('getInitVideos', async (callback) => {
      //第一次挂载时拉取videolist

      const videosData = await _this.LoadInitVideos();

      callback(videosData);

    })
  },

  mounted() {
    this.$refs.player.rendered = true;
    this.$refs.player.dialog = true;
    let _this = this
    GetUserViewVideo.$on('getNewVideo',async (length,callback)=>{
      /*const newVideo = await _this.LoadNewVideo(length);
      callback(newVideo);
*/
    })

  }
}
</script>

<template>
  <el-dialog :visible.sync="dialogFormVisible" ref="dialog" width="70%"
             top="5vh"
             :before-close="closeDialog"
             class="dialog">

    <PlayerView v-if="dialogFormVisible" ref="player"  style="width: 100%; height: 800px;"></PlayerView>
  </el-dialog>

</template>

<style scoped lang="stylus">

</style>