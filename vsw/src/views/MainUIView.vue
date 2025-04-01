<script >
import Middle from '@/utils/middle.js';
import fromLogin from '@/utils/LoginViewToMainUIView';
import toLogin from '@/utils/toLogin'
import ChatView from "@/views/ChatView.vue";
import MessageView from "@/views/MessageView.vue";
import LoginView from "@/views/LoginView.vue";
import loginView from "@/views/LoginView.vue";

  export default {
    computed: {

    },
    components: {LoginView, ChatView, MessageView},
    data(){
      return{
        userinfo:{

        },
        isLogin:false,
        input_search: '',
        button_Search_isDisable: true,
        dialogVisible:{
          messageView:false,
          chatView:false,
          logView:false,
        }
      }
    },
    watch:{

    },
    beforeMount(){
      let _this = this
      //console.log("登陆状态"+localStorage.getItem("isLogin"))
      if(localStorage.getItem("isLogin")===null){
        console.log("未登录")
        this.isLogin = false
        _this.dialogVisible.logView =  true
      }else{
        console.log("已登录")
        this.isLogin = true
        _this.dialogVisible.logView = false;
      }

    },
    mounted(){
      let _this = this
      //console.log("登陆状态"+localStorage.getItem("isLogin"))
      fromLogin.$on('login',(data)=>{
        _this.handleCloseLog();
        _this.isLogin = true;
      })
      toLogin.$on('log',(data)=>{
        _this.login();
      })
      if(localStorage.getItem('userInfo')!==null){
        this.userinfo = JSON.parse(localStorage.getItem('userInfo'))
        console.log(this.userinfo)
      }
    },
    methods:{

      test(a){console.log("test"+a)},
      toCreator(){
        this.$router.push({name:'creator'}, () => {});
      },
      logout(){
        this.$router.go(0);
        this.isLogin = false;
        localStorage.clear();
      },
      login(){
        this.dialogVisible.logView= true;
      },
      handleCloseLog(){
        this.dialogVisible.logView = false
      },
     /* handleOpenMessageView(){
        this.dialogVisible.messageView=true
      },
      handleCloseMessageView(){

      },
      handleOpenChatView(){
        this.dialogVisible.chatView=true
      },
      handleCloseChatView(){

      },*/
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
      <!-- 登陆弹窗-->
      <el-dialog :visible="this.dialogVisible.logView" :before-close="handleCloseLog" :close-on-click-modal="false">
          <LoginView></LoginView>
      </el-dialog>
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
              <el-popover placement="bottom" title="通知" trigger="hover">
                  <el-button slot="reference">通知</el-button>
                  <MessageView style="height: 500px;width: 300px"></MessageView>
              </el-popover>
              <el-popover placement="bottom" title="私信" trigger="hover">
                  <el-button slot="reference">私信</el-button>
                  <ChatView style="height: 500px;width: 300px"></ChatView>
              </el-popover>
              <el-button @click="toCreator">投稿</el-button>

                <el-popover v-if="isLogin===true" placement="bottom" title="" trigger="hover">
                  <el-button slot="reference">{{ userinfo.userId }}</el-button>

                  {{userinfo.userName}}<br>
                  关注
                  {{userinfo.subscriber}}
                  粉丝
                  {{userinfo.fans}}

                  <br>
                  <el-button  @click="logout">注销</el-button>
                </el-popover>

                <el-button v-if="isLogin===false" @click="login">登录</el-button>





            </div>


          </el-header>
          <el-main>
            <keep-alive >
                <router-view v-if="$route.meta.keepAlive" />
            </keep-alive>
            <router-view v-if="!$route.meta.keepAlive" />
          </el-main>
        </el-container>
      </el-container>
    </div>
</template>

<style scoped lang="stylus">
//引入图标
@import "~@/assets/css/icons.styl";

//搜索按钮渲染
.search-button {
  pointer-events: none; // 禁用鼠标点击
}

.xth {
  display: inline;
  float: right;
}

.left {
  width: 200px !important;
  //根据计算得出左侧栏布局
  --iconsheight: 100px; // 通过此变量根据左上角 logo 大小控制 header 大小
  --bottomheight: 100px;

  .el-header {
    height: var(--iconsheight) !important;
    background-color: #f0f0f0; // 背景色为浅灰色
  }

  .el-main {
    height: calc(100vh - var(--iconsheight) - var(--bottomheight)) !important;
    background-color: #ffffff; // 主体区域背景色
  }

  .el-footer {
    height: var(--bottomheight) !important;
    background-color: #f0f0f0; // 背景色为浅灰色
  }
}

.ui {
  height: 100%;
  margin: 0;
  padding: 0;
}

//隐藏滚动条
.demo::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

.demo {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
  overflow-x: hidden;
  overflow-y: auto;
}

.operate {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  padding: 10px; // 添加内边距
}

.operate-button {
  width: 100%;
  height: 100px;
  margin: 10px;
  background-color: #007bff; // 初始背景色为蓝色
  color: white; // 按钮文字颜色
  border: none; // 去掉边框
  border-radius: 5px; // 圆角按钮
  transition: background-color 0.3s, transform 0.2s; // 添加过渡效果
}

//按钮选中时颜色
.operate-button:focus {
  background-color: #0056b3; // 聚焦时颜色为深蓝色
  outline: none; // 去掉默认聚焦轮廓
}

.operate-button:hover {
  background-color: #0056b3; // 悬停时颜色为深蓝色
  transform: translateY(-2px); // 悬停时轻微上移
}
</style>


