<template>
  <div id="app">

   <MainUIView></MainUIView>
<!--      <router-link to="/main">MainUI</router-link> |-->
<!--      <router-link to="/">Home</router-link> |-->
<!--      <router-link to="/about">About</router-link>-->

  </div>
</template>

<style lang="stylus">


</style>
<script >
import MainUIView from "@/views/MainUIView.vue";
export default {
  data(){
    return{

    }
  },
  methods:{
    logout(){
      localStorage.clear();
    }
  },
  components:{MainUIView}
}
</script>