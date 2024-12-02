<script >
  export default {
    data(){
      return{
        input_search: '',
      }
    },
    methods:{
      //点击清空按钮时触发
      clearSearch(){
        alert("点击清空按钮时触发")
      }
    }
  }
</script>

<template>
    <div class="ui">
      <!--容器布局-->
      <el-container class="ui">
        <!--侧边栏-->
        <el-aside>
          <el-header>
            <el-icon class="el-icon-platform-eleme"></el-icon>
          </el-header>

          <el-main>
            <div class="operate">
              <el-button class="operate-button">推荐</el-button>
              <el-button class="operate-button">关注</el-button>
              <el-button class="operate-button">聊天</el-button>
              <el-button class="operate-button">我的</el-button>
              <el-button class="operate-button">设置</el-button>
            </div>

          </el-main>


        </el-aside>
        <el-container>
          <el-header>
            <el-input placeholder="请输入内容" v-model="input_search" class="input-with-select" clearable @clear="clearSearch">
              <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
          </el-header>
          <el-main>
              显示界面
          </el-main>
        </el-container>
      </el-container>
    </div>
</template>

<style scoped lang="stylus">
  .ui{
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .el-input{
    width: 500px;

  }
  .operate{
    display:flex;
    flex-wrap:wrap;
    //justify-content: flex-start;
    align-items: center;
  }

  .operate-button{
    width: 100%;
    height: 100px;
    margin: 10px;
  }
  //按钮选中时颜色
  .operate-button:focus{
    background-color: rgb(128, 128, 128);
    color: white;
  }
  .operate-button:hover{
    background-color: rgb(128, 128, 128);
    color: white;
  }





</style>