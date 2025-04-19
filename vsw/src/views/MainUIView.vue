<script >
import Middle from '@/utils/middle.js';
import fromLogin from '@/utils/LoginViewToMainUIView';
import toLogin from '@/utils/toLogin'
import ChatView from "@/views/ChatView.vue";
import MessageView from "@/views/MessageView.vue";
import LoginView from "@/views/LoginView.vue";
import loginView from "@/views/LoginView.vue";
import axios from "axios";

export default {
    computed: {

    },
    components: {LoginView, ChatView, MessageView},
    data(){
      return{
        userinfo:{
          profile:''
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
      '$route'(val){
        if(val.name==='user' ) {
          if (val.query.id !== 'self') {
            this.$refs.elMenu.activeIndex = null
          }else{
            this.$refs.elMenu.activeIndex = 'user'
          }
        }

      }
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
    async mounted() {
      let _this = this
      //console.log("登陆状态"+localStorage.getItem("isLogin"))
      fromLogin.$on('login', (data) => {
        _this.handleCloseLog();
        _this.isLogin = true;
      })
      toLogin.$on('log', (data) => {
        _this.login();
      })
      if (localStorage.getItem('userInfo') !== null) {
        _this.userinfo = JSON.parse(localStorage.getItem('userInfo'))

        let avatar = this.userinfo.avatar

        axios.get(`/image/getUrl/${avatar}`).then((response) => {

          avatar = response.data.data

          _this.userinfo.profile = avatar

          this.$forceUpdate()
        })

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

          //调用全局函数
          this.toUserView(user_id)


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
<!--
<template>
    <div class="ui">
      &lt;!&ndash; 登陆弹窗&ndash;&gt;
      <el-dialog :visible="this.dialogVisible.logView" :before-close="handleCloseLog" :close-on-click-modal="false">
          <LoginView></LoginView>
      </el-dialog>
      &lt;!&ndash;容器布局&ndash;&gt;
      <el-container class="ui">
        &lt;!&ndash;侧边栏&ndash;&gt;
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
              <el-button slot="append" icon="el-icon-search" @click="clickSearch"  ></el-button> &lt;!&ndash;:disabled="input_search===''" :class="{'search-button':input_search===''}"&ndash;&gt;
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
  &#45;&#45;iconsheight: 100px; // 通过此变量根据左上角 logo 大小控制 header 大小
  &#45;&#45;bottomheight: 100px;

  .el-header {
    height: var(&#45;&#45;iconsheight) !important;
    background-color: #f0f0f0; // 背景色为浅灰色
  }

  .el-main {
    height: calc(100vh - var(&#45;&#45;iconsheight) - var(&#45;&#45;bottomheight)) !important;
    background-color: #ffffff; // 主体区域背景色
  }

  .el-footer {
    height: var(&#45;&#45;bottomheight) !important;
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
</style>-->

<template>
  <!-- 主界面根容器 -->
  <div class="main-ui-container">
    <!-- 登录弹窗 -->
    <el-dialog
        :visible.sync="dialogVisible.logView"
        :before-close="handleCloseLog"
        :close-on-click-modal="false"
        width="450px"
        append-to-body
        custom-class="login-dialog"
        :show-close="false">
      <!-- 自定义头部，添加关闭按钮 -->
      <div slot="title" class="login-dialog-header">
        <span>欢迎登录</span>
        <i class="el-icon-close dialog-close-icon" @click="handleCloseLog"></i>
      </div>
      <!-- 嵌入登录视图组件 -->
      <LoginView></LoginView>
    </el-dialog>

    <!-- Element UI 容器布局 -->
    <el-container class="main-layout">
      <!-- 左侧边栏 -->
      <el-aside width="220px" class="main-aside">
        <!-- Logo 区域 -->
        <div class="aside-header">
          <!-- 可以放置 Logo 图片或文字 -->
          <span class="logo-text">Logo</span>
          <!-- <img src="@/assets/logo.png" alt="Logo" class="logo-image"> -->
          <!-- 原始模板: <i class="el-icon-logo"></i> -->
        </div>

        <!-- 导航菜单区域 -->
        <!-- 使用 el-menu 替代原始按钮组，更符合导航场景 -->
        <el-menu
            ref = "elMenu"
            :default-active="$route.name"
            class="aside-menu"
            background-color="#ffffff"
            text-color="#303133"
            active-text-color="#409EFF"
            router>
          <!-- router 模式可以直接通过 index 跳转路由 -->
          <el-menu-item index="recommend" :route="{ name: 'recommend' }">
            <i class="el-icon-discover"></i>
            <span slot="title">推荐</span>
          </el-menu-item>
          <el-menu-item index="follow" :route="{ name: 'follow' }">
            <i class="el-icon-star-off"></i>
            <span slot="title">关注</span>
          </el-menu-item>
          <!-- 聊天功能可以单独处理或放入菜单 -->
          <!-- <el-menu-item index="chat" :route="{ name: 'chat' }">
            <i class="el-icon-chat-dot-round"></i>
            <span slot="title">聊天</span>
          </el-menu-item> -->
          <el-menu-item  index="user" :route="{ name: 'user',query:{id:'self'} }">
            <i class="el-icon-user"></i>
            <span slot="title">我的</span>
          </el-menu-item>
        </el-menu>
        <!-- 原始模板:
        <el-main class="demo"> <div class="operate"> <el-button @click="clickRecommend">推荐</el-button> ... </div> </el-main>
        -->

        <!-- 底部设置区域 -->
        <div class="aside-footer">
          <el-button type="text" icon="el-icon-setting">设置</el-button>
          <!-- 原始模板: <el-footer> <el-button>设置</el-button> </el-footer> -->
        </div>
      </el-aside>

      <!-- 右侧主内容区容器 -->
      <el-container class="main-content-container">
        <!-- 顶部栏 -->
        <el-header class="main-header" height="60px">
          <!-- 搜索框 -->
          <div class="search-box">
            <el-input
                placeholder="搜索视频、用户或内容..."
                v-model="input_search"
                class="search-input"
                clearable
                @clear="clearSearch"
                @keyup.enter.native="clickSearch">
              <!-- 使用 el-button 作为 append -->
              <el-button slot="append" icon="el-icon-search" @click="clickSearch" :disabled="input_search.trim() === ''"></el-button>
            </el-input>
            <!-- 原始模板: <el-input class="input-with-select">...</el-input> -->
          </div>

          <!-- 右侧操作按钮和用户信息 -->
          <div class="header-actions">
            <!-- 投稿按钮 -->
            <el-button type="primary" size="medium" icon="el-icon-upload2" @click="toCreator" class="action-button">投稿</el-button>

            <!-- 通知按钮 -->
            <el-popover placement="bottom-end" width="350" trigger="click" popper-class="action-popover">
              <div class="popover-content">
                <MessageView style="max-height: 400px; overflow-y: auto;"></MessageView>
              </div>
              <el-badge :value="12" :max="99" class="action-badge" slot="reference"> <!-- 示例 Badge -->
                <el-button type="text" icon="el-icon-bell" class="action-icon-button" title="通知"></el-button>
              </el-badge>
            </el-popover>

            <!-- 私信按钮 -->
            <el-popover placement="bottom-end" width="380" trigger="click" popper-class="action-popover">
              <div class="popover-content">
                <ChatView style="max-height: 450px;"></ChatView>
              </div>
              <el-badge is-dot class="action-badge" slot="reference"> <!-- 示例小红点 -->
                <el-button type="text" icon="el-icon-message" class="action-icon-button" title="私信"></el-button>
              </el-badge>
            </el-popover>

            <!-- 用户信息/登录 -->
            <div class="user-section">
              <!-- 如果已登录，显示用户信息 Popover -->
              <el-popover
                  v-if="isLogin"
                  placement="bottom-end"
                  width="250"
                  trigger="hover"
                  popper-class="user-popover"
                  >
                <template #reference>
                  <el-avatar :size="45" :src="userinfo.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" ></el-avatar>
                </template>
                <!-- Popover 内容 -->
                <div class="user-popover-content">
                  <div class="user-info-header">
                    <el-avatar :size="45" :src="userinfo.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" :key="userinfo.profile"></el-avatar>
                    <div class="user-info-text">

                      <span class="user-popover-name">{{ userinfo.userName || '未命名用户' }}</span>
                      <span class="user-popover-id">ID: {{ userinfo.userId || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="user-stats-popover">
                    <span>关注 {{ userinfo.subscriber || 0 }}</span>
                    <el-divider direction="vertical"></el-divider>
                    <span>粉丝 {{ userinfo.fans || 0 }}</span>
                  </div>
                  <el-divider class="popover-divider"></el-divider>
                  <div class="user-actions-popover">
                    <el-button type="text" icon="el-icon-user" @click="clickUser('self')">个人主页</el-button>
                    <el-button type="text" icon="el-icon-switch-button" @click="logout" style="color: #F56C6C;">退出登录</el-button>
                  </div>
                </div>
                <!-- 触发 Popover 的元素 -->
                <el-avatar slot="reference"
                           :size="36"
                           :src="userinfo.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                           class="header-avatar">
                </el-avatar>
              </el-popover>

              <!-- 如果未登录，显示登录按钮 -->
              <el-button v-else type="primary" size="medium" @click="login" class="action-button">登录</el-button>
            </div>
            <!-- 原始模板对应内容: <div class="xth"> <el-popover> <el-button>通知</el-button> ... </el-popover> ... <el-button>投稿</el-button> <el-popover v-if="isLogin">...</el-popover> <el-button v-if="!isLogin">登录</el-button> </div> -->
          </div>
        </el-header>

        <!-- 主内容显示区域 -->
        <el-main class="main-content">
          <!-- 使用 keep-alive 缓存路由 -->
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive" :key="$route.fullPath"/>
          </keep-alive>
          <!-- 不缓存的路由 -->
          <router-view v-if="!$route.meta.keepAlive" :key="$route.fullPath"/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="stylus">
// --- 主界面整体布局 ---
.main-ui-container {
  height: 100vh; // 占满整个视口高度
  overflow: hidden; // 防止内部滚动条影响布局
}

.main-layout {
  height: 100%; // 继承父容器高度
}

// --- 左侧边栏样式 ---
.main-aside {
  background-color: #ffffff; // 侧边栏背景色
  border-right: 1px solid #e6e6e6; // 右边框线
  display: flex;
  flex-direction: column; // 垂直布局
  transition: width 0.3s ease; // 可选：宽度过渡动画
}

.aside-header {
  height: 60px; // 与顶部栏高度一致
  display: flex;
  align-items: center;
  justify-content: center; // Logo 居中
  padding: 0 20px; // 左右内边距
  border-bottom: 1px solid #f0f0f0; // 底部边框
  flex-shrink: 0; // 不压缩 header 高度
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  // 如果使用图片 Logo
  // .logo-image { height: 30px; width: auto; }
}

.aside-menu {
  flex-grow: 1; // 占据剩余空间
  border-right: none !important; // 去掉 el-menu 默认的右边框
  overflow-y: auto; // 内容过多时滚动
  overflow-x: hidden; // 隐藏横向滚动条
  // 菜单项样式
  .el-menu-item {
    height: 50px; // 菜单项高度
    line-height: 50px; // 行高使其垂直居中
    font-size: 14px; // 菜单项字号
    i { // 图标样式
      margin-right: 10px; // 图标与文字间距
      font-size: 18px; // 图标大小
      width: 24px; // 固定图标宽度，使其对齐
      text-align: center;
      color: #909399; // 默认图标颜色
    }
    &.is-active { // 选中项样式
      background-color: #ecf5ff !important; // 选中背景色
      i { color: #409EFF; } // 选中图标颜色
    }
    &:hover { // 悬停样式
      background-color: #f5f7fa !important;
    }
  }
}

.aside-footer {
  height: 60px; // 底部区域高度
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #f0f0f0; // 顶部边框
  flex-shrink: 0; // 不压缩 footer 高度
  .el-button--text {
    color: #606266;
    font-size: 14px;
    i { margin-right: 5px; }
    &:hover { color: #409EFF; }
  }
}


// --- 右侧主内容区 ---
.main-content-container {
  // 无需特殊样式，由内部 header 和 main 填充
}

.main-header {
  background-color: #ffffff; // 顶部栏背景色
  border-bottom: 1px solid #e6e6e6; // 底部边框
  padding: 0 20px; // 左右内边距
  display: flex; // 使用 Flex 布局
  align-items: center; // 垂直居中
  justify-content: space-between; // 两端对齐
}

.search-box {
  flex-grow: 1; // 占据多余空间
  max-width: 450px; // 限制最大宽度
}

.search-input >>> .el-input__inner {
  border-radius: 20px 0 0 20px; // 左侧圆角
}
.search-input >>> .el-input-group__append {
  background-color: #409EFF; // 按钮背景色
  border-color: #409EFF;
  color: #ffffff; // 按钮图标颜色
  border-radius: 0 20px 20px 0; // 右侧圆角
  padding: 0 15px; // 按钮内边距
  button { // 去掉按钮默认边框和背景
    border: none;
    background: none;
    &:hover { // 悬停效果
      opacity: 0.9;
    }
  }
}
.search-input >>> .el-input-group__append .el-button:focus,
.search-input >>> .el-input-group__append .el-button:hover {
  background-color: #66b1ff; // 悬停/聚焦背景色
  border-color: #66b1ff;
}


.header-actions {
  display: flex;
  align-items: center; // 垂直居中
}

.action-button {
  margin-left: 15px; // 按钮间距
  padding: 9px 15px; // 调整按钮大小
}
.action-icon-button {
  font-size: 20px; // 图标按钮大小
  color: #606266; // 图标颜色
  margin: 0 8px; // 图标按钮左右间距
  padding: 5px; // 增加点击区域
  border-radius: 50%; // 圆形背景（悬停时）
  &:hover {
    color: #409EFF;
    background-color: #f5f7fa;
  }
}
.action-badge { // 徽标位置调整
  margin-left: 10px;
  line-height: 1; // 防止影响布局
  vertical-align: middle; // 对齐图标按钮
  sup { // 调整徽标具体位置
    top: -2px;
    right: 8px;
  }
  .el-badge__content.is-dot { // 小红点位置
    top: 0px;
    right: 5px;
  }
}


.user-section {
  margin-left: 15px; // 用户区域与其他按钮间距
  display: flex;
  align-items: center;
}

.header-avatar {
  cursor: pointer; // 鼠标悬停变手型
  border: 1px solid #eee; // 可选：头像边框
}

// 用户信息 Popover 样式
.user-popover {
  padding: 0 !important; // 去掉 Popover 默认内边距
}
.user-popover-content {
  padding: 15px;
}
.user-info-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.user-info-text {
  margin-left: 10px;
  display: flex;
  flex-direction: column;
}
.user-popover-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 3px;
}
.user-popover-id {
  font-size: 12px;
  color: #909399;
}
.user-stats-popover {
  font-size: 13px;
  color: #606266;
  display: flex;
  justify-content: space-around; // 均匀分布
  margin-bottom: 12px;
  span { // 数字加粗
    strong { font-weight: 500; color: #303133; margin-right: 3px;}
  }
  .el-divider--vertical { height: 1em; }
}
.popover-divider {
  margin: 10px 0;
}
.user-actions-popover {
  display: flex;
  justify-content: space-between; // 左右分布按钮
  .el-button--text {
    padding: 5px 0; // 减小内边距
    font-size: 14px;
    i { margin-right: 5px; }
  }
}

// 右侧主内容区域
.main-content {
  background-color: #f5f7fa; // 主内容区背景色
  padding: 20px; // 内边距
  height: calc(100vh - 60px); // 计算高度，减去 header
  overflow-y: auto; // 内容超出时滚动
}

// 登录弹窗样式
.login-dialog >>> .el-dialog__header { // 覆盖头部默认样式
  display: none; // 隐藏默认头部
}
.login-dialog >>> .el-dialog__body {
  padding: 0; // 去掉 body 内边距，让 LoginView 填满
}
// 自定义弹窗头部
.login-dialog-header {
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  .dialog-close-icon {
    cursor: pointer;
    color: #909399;
    font-size: 18px;
    &:hover { color: #409EFF; }
  }
}

// 隐藏滚动条 (适用于 Webkit 内核，如 Chrome, Safari)
.aside-menu::-webkit-scrollbar,
.main-content::-webkit-scrollbar {
  width: 6px;
}
.aside-menu::-webkit-scrollbar-thumb,
.main-content::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 3px;
}
.aside-menu::-webkit-scrollbar-track,
.main-content::-webkit-scrollbar-track {
  background: transparent;
}
// Firefox 滚动条 (简单隐藏)
.aside-menu, .main-content {
  scrollbar-width: thin;
  scrollbar-color: #dcdfe6 transparent;
}

</style>
