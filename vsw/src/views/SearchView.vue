<script>
export default {
  data() {
    return {
      searching:'',
      type:''
    }
  },
  methods:{
    changeType(type){ //更改type时调用
      //更改路由
      this.$router.push({
        name:'search',
        query:{
          key: this.searching,
          type: type
        }
      }, () => {});
      //!!!执行数据调用
    },
    clickGeneralSearch(){
      this.changeType('general')
    },
    clickVideoSearch(){
      this.changeType('video')
    },
    clickUserSearch(){
      this.changeType('user')
    },
  },
  mounted() {
    //将搜索关键词赋值
    this.searching=this.$route.query.key
    this.type=this.$route.query.type
  },
  watch:{
    //监听路由更改时将搜索结果赋值
    '$route.query'(newKey){
      if(this.$route.name==='search')   //当路由为该界面时
      {
        this.searching=newKey.key
        this.type=newKey.type
      }

    }
  }
}
</script>

<template>

  <div>
    <el-container>
      <el-header>
        <el-button @click="clickGeneralSearch">综合</el-button>
        <el-button @click="clickVideoSearch">视频</el-button>
        <el-button @click="clickUserSearch">用户</el-button>

      </el-header>
      <el-main>
        <i>搜索</i>
        <i >{{searching}}</i>
        <i >{{type}}</i>
      </el-main>
    </el-container>

  </div>

</template>

<style scoped lang="stylus">

</style>