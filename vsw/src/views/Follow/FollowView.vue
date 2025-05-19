<script >
import PlayerView from "@/views/PlayerView.vue";
import axios from "axios";
export default {
  components: {PlayerView},
  data() {
    return {
      userid: -1
    }
  },
  methods: {
    fetchInitialVideosForPlayerView() {
      // 确保 userid 已被设置
      if (this.userid === -1) {
        console.warn("User ID not set, cannot fetch initial videos.");
        return Promise.resolve([]); // 返回一个空的 resolved Promise
      }
      console.log(`Parent: Fetching initial videos for user ${this.userid}`);
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
      if (this.userid === -1) {
        console.warn("User ID not set, cannot fetch more videos.");
        return Promise.resolve([]);
      }
      console.log(`Parent: Fetching more videos for user ${this.userid}, current length: ${currentListLength}`);
      // 你可以利用 currentListLength 来实现分页或不同的拉取策略
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
  created() {
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
  <PlayerView ref="playerView" :load-initial-videos-function="fetchInitialVideosForPlayerView"
              :load-more-videos-function="fetchMoreVideosForPlayerView"></PlayerView>
</template>


<style scoped lang="stylus">

</style>