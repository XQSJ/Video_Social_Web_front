<script >
import PlayerView from "@/views/PlayerView.vue";
import axios from "axios";
export default {
  components: {PlayerView},
  data(){
    return{
      userid:-1
    }
  },
  methods: {
    fetchInitialVideosForPlayerView() {
      return axios.get(`/video/getRecVideoList/${this.userid}/10`)
          .then((response) => {
            return response.data.data || []; // 确保返回数组
          })
          .catch(error => {
            console.error("Parent: Error fetching initial videos:", error);
            return []; // 出错时返回空数组
          });

    },
    fetchMoreVideosForPlayerView(currentListLength) {
      return axios.get(`/video/getRecVideoList/${this.userid}/2`) // 假设每次拉取2个
          .then((response) => {
            return response.data.data || [];
          })
          .catch(error => {
            console.error("Parent: Error fetching more videos:", error);
            return [];
          });
    },
  },
  created(){

    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }

  },

  mounted() {
  }
}
</script>

<template>
  <PlayerView ref="playerView"  :load-initial-videos-function="fetchInitialVideosForPlayerView"
              :load-more-videos-function="fetchMoreVideosForPlayerView"></PlayerView>
</template>




<style scoped lang="stylus">

</style>