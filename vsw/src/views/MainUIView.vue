<script >
import Middle from '@/utils/middle.js';
  export default {
    data(){
      return{
        input_search: '',
        button_Search_isDisable: true,
      }
    },
    methods:{
      //点击用户时触发
      clickUser(user_id){
        if(true){     //！！！修改为若该用户存在时
          //调用全局函数
          this.toUserView(user_id)

        }
      },
      //点击推荐按钮时触发
      clickRecommend(){
        this.$router.push({name:'recommend'}, () => {});
      },
      //点击关注按钮时触发
      clickFollow(){
        this.$router.push({name:'follow'}, () => {});
      },
      //点击清空按钮时触发
      clearSearch(){
        //alert("点击清空按钮时触发")
        //this.input_search=''
      },
      //点击搜索按钮时触发
      clickSearch(){
        //若input_search不为空时触发
         if(this.input_search!==''){
            if(this.$route.name!=='search'){

              this.$router.push({
                name:'search',
                query:{
                  key: this.input_search,
                  type: 'general'
                }
              }, () => {});
            }
            else{
              Middle.$emit('search');
            }

         }
      }
    }
  }
</script>

<template>
    <div class="ui">
      <!--容器布局-->
      <el-container class="ui">
        <!--侧边栏-->
        <el-aside class="left">
          <el-header style="border-style:solid;border-width:1px;">
            <i class="el-icon-logo"></i>
          </el-header>

          <el-main class="demo">
            <div class="operate" >
              <el-button :class="{'operate-button':true}" @click="clickRecommend">推荐</el-button>
              <el-button :class="{'operate-button':true}" @click="clickFollow">关注</el-button>
              <el-button :class="{'operate-button':true}" @click="">聊天</el-button>
              <el-button :class="{'operate-button':true}" @click="clickUser('self')">我的</el-button>

            </div>

          </el-main>
          <el-footer style="border-style:solid;border-width:1px;">
            <el-button >设置</el-button>
          </el-footer>

        </el-aside>
        <el-container>
          <el-header>
            <el-input placeholder="请输入内容" v-model="input_search" class="input-with-select" clearable @clear="clearSearch">
              <el-button slot="append" icon="el-icon-search" @click="clickSearch"  ></el-button> <!--:disabled="input_search===''" :class="{'search-button':input_search===''}"-->
            </el-input>
            <div class="xth">
              <el-button>通知</el-button>
              <el-button>私信</el-button>
              <el-button>投稿</el-button>
              <el-button>主页</el-button>
            </div>


          </el-header>
          <el-main>
              <router-view></router-view>
          </el-main>
        </el-container>
      </el-container>
    </div>
</template>

<style scoped lang="stylus">
 //引入图标
  @import "~@/assets/css/icons.styl";
 //搜索按钮渲染
  .search-button{
    //禁用鼠标点击
    pointer-events: none;
  }

  .xth{
    display: inline;
    float: right;
  }
  .left{
    width:200px !important;
    //根据计算得出左侧栏布局
    --iconsheight: 100px;         //通过此变量根据左上角logo大小控制header大小
    --bottomheight:100px;
    .el-header{

      height:var(--iconsheight) !important;
    }
    .el-main{
      height:calc(100vh - var(--iconsheight) - var(--bottomheight)) !important;
    }
    .el-footer{
      height:var(--bottomheight) !important;
    }
  }


  .ui{
    height: 100%;
    margin: 0;
    padding: 0;

  }
  //隐藏滚动条
 .demo::-webkit-scrollbar {
   display: none; /* Chrome Safari */
 }
 .demo {
   scrollbar-width: none; /* firefox */
   -ms-overflow-style: none; /* IE 10+ */
   overflow-x: hidden;
   overflow-y: auto;
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