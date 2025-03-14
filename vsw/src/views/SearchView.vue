<script>
import Middle from '@/utils/middle.js';
export default {
  data() {
    return {
      searching:'',
      type:''
    }
  },
  methods:{
    back(){ //返回上一个界面

      this.$router.go(-1)
    },
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
    Search(){ //执行搜索
      console.log("sousuo"+this.searching+this.type)
    }
  },
  mounted() {
    let _this = this
    Middle.$on('search',(data)=>{
      _this.Search();
    })
    //将搜索关键词赋值
    this.searching=this.$route.query.key
    this.type=this.$route.query.type
    this.Search();
  },
  watch:{
    //监听路由更改时将搜索结果赋值
    '$route.query'(newKey){
      if(this.$route.name==='search')   //当路由为该界面时
      {
        this.searching=newKey.key
        this.type=newKey.type
        this.Search();
      }

    }
  }
}
</script>

<template>

  <div>
    <el-container>
      <el-header>
        <el-button @click="back"> 返回</el-button>
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