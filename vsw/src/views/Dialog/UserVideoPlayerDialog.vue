<script >

import PlayerView from "@/views/PlayerView.vue";
import axios from "axios";

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
    fetchInitialVideosForPlayerView() {
      return [
        {"videoId": this.videoId}
      ]
    },
    fetchMoreVideosForPlayerView(currentListLength) {
    },

  },
  created(){
    let _this = this
    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }
  },

  mounted() {

  }
}
</script>

<template>
  <el-dialog :visible.sync="dialogFormVisible" ref="dialog" width="70%"
             top="5vh"
             :before-close="closeDialog"
             class="dialog">
    <!-- 设置标题 -->
    <span slot="title" class="dialog-title">{{
        /* currentVideo ? currentVideo.title : */
        '视频播放'
      }}</span>
    <PlayerView v-if="dialogFormVisible" ref="player"  style="width: 100%; height: 800px;"
                :load-initial-videos-function="fetchInitialVideosForPlayerView"
                :load-more-videos-function="fetchMoreVideosForPlayerView"></PlayerView>
  </el-dialog>

</template>

<style scoped lang="stylus">

</style>