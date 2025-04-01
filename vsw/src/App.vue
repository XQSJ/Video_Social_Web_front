<template>
  <div id="app">

   <MainUIView></MainUIView>
<!--      <router-link to="/main">MainUI</router-link> |-->
<!--      <router-link to="/">Home</router-link> |-->
<!--      <router-link to="/about">About</router-link>-->

  </div>
</template>

<style lang="stylus">

/* 隐藏全局滚动条 */
::-webkit-scrollbar {
  display: none;
}

/* 对于IE和Edge */
body {
  -ms-overflow-style: none;  /* Windows Edge, IE 浏览器的滚动条隐藏 */
  scrollbar-width: none;  /* Firefox 浏览器的滚动条隐藏 */
}

</style>
<script >
import MainUIView from "@/views/MainUIView.vue";
import axios from "axios";
export default {
  data(){
    return{

    }
  },
  methods:{
    logout(){
      localStorage.clear();
    },

  },
  components:{MainUIView}
}
</script>