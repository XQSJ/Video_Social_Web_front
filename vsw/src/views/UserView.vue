<script>
  export default {
    data() {
      return {
        userid:''
      }
    },
    mounted() {
      //将id赋值
      this.userid=this.$route.query.id
    },
    watch:{
      //监听路由更改时将id赋值
      '$route.query'(newId){
        if(this.$route.name==='user'){  //当路由为该界面时
          this.userid=newId.id
        }

      }
    }
  }
</script>

<template>
   <el-container style="height: 100%">
       <el-header>
          <el-row>
            <el-col :span="4">头像</el-col>
            <el-col :span="12">
              <el-row>用户名</el-row>
              <el-row>{{userid}}</el-row>

            </el-col>

          </el-row>
       </el-header>
       <el-main>

       </el-main>
   </el-container>
</template>

<style scoped lang="stylus">

</style>