<script>
import Middle from '@/utils/middle.js';
import handleMainMenu from "@/utils/handleMainMenu";
import fromLogin from '@/utils/LoginViewToMainUIView';
import toLogin from '@/utils/toLogin'
import ChatView from "@/views/ChatView.vue";
import MessageView from "@/views/MessageView.vue";
import LoginView from "@/views/LoginView.vue";
import loginView from "@/views/LoginView.vue";
import axios from "axios";

export default {
  computed: {},
  components: {LoginView, ChatView, MessageView},
  data() {
    return {
      userid: -1,
      newMessage: false,
      userinfo: {
        profile: ''
      },
      isLogin: false,
      input_search: '',
      button_Search_isDisable: true,
      dialogVisible: {
        messageView: false,
        chatView: false,
        logView: false,
      }
    }
  },
  watch: {},
  beforeMount() {
    let _this = this
    //console.log("登陆状态"+localStorage.getItem("isLogin"))
    if (localStorage.getItem("isLogin") === null) {
      console.log("未登录")
      this.isLogin = false
      _this.dialogVisible.logView = true
    } else {
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
    handleMainMenu.$on('cancel', () => {
      this.$refs.elMenu.activeIndex = null
    })
    handleMainMenu.$on('user', () => {
      this.$refs.elMenu.activeIndex = 'user'
    })
    if (localStorage.getItem('userInfo') !== null) {
      _this.userinfo = JSON.parse(localStorage.getItem('userInfo'))

      let avatar = this.userinfo.avatar

      axios.get(`/image/getUrl/${avatar}`).then((response) => {

        avatar = response.data.data

        _this.userinfo.profile = avatar

        this.$forceUpdate()
      })
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }

    if (this.userid !== -1) { //若登录
      //轮询 创建定时器
      this.timer = window.setInterval(() => {
        setTimeout(() => {

          //this.existNewMessages();
        }, 0)
      }, 3000);
    }
  },
  methods: {
    existNewMessages() {
      if (this.dialogVisible.messageView === false) {
        axios.get(`/message/exist/${this.userid}`).then((response) => {
          if (response.data.code === 1) {
            this.newMessage = response.data.data
          }
        })
      }

    },
    test(a) {
      console.log("test" + a)
    },
    toCreator() {
      this.$router.push({name: 'creator'}, () => {
      });
    },
    logout() {
      this.$router.go(0);
      this.isLogin = false;
      localStorage.clear();
    },
    login() {
      this.dialogVisible.logView = true;
    },
    handleCloseLog() {
      this.dialogVisible.logView = false
    },
    checkNew() {
      this.newMessage = false;
    },
    handleOpenMessageView() {
      //console.log("openmessageview")
      this.dialogVisible.messageView = true


    },

    handleCloseMessageView() {
      this.dialogVisible.messageView = false

    },
    /*
    handleOpenChatView(){
      this.dialogVisible.chatView=true
    },
    handleCloseChatView(){

    },*/
    //点击用户时触发
    clickUser(user_id) {

      //调用全局函数
      this.toUserView(user_id)


    },
    //点击推荐按钮时触发
    clickRecommend() {
      this.$router.push({name: 'recommend'}, () => {
      });
    },
    //点击关注按钮时触发
    clickFollow() {
      this.$router.push({name: 'follow'}, () => {
      });
    },
    //点击清空按钮时触发
    clearSearch() {
      //alert("点击清空按钮时触发")
      //this.input_search=''
    },
    //点击搜索按钮时触发
    clickSearch() {
      //若input_search不为空时触发
      if (this.input_search !== '') {
        if (this.$route.name !== 'search') {

          this.$router.push({
            name: 'search',
            query: {
              key: this.input_search,
              type: 'general'
            }
          }, () => {
          });
        } else {
          Middle.$emit('search');
        }

      }
    }
  }
}
</script>

<template>
  <!-- 主界面根容器 -->
  <div class="main-ui-container dark-theme"> <!-- ✨ 添加 dark-theme 类 -->
    <!-- 登录弹窗 (样式将通过 custom-class 调整) -->
    <el-dialog
        :visible.sync="dialogVisible.logView"
        :before-close="handleCloseLog"
        :close-on-click-modal="false"
        width="380px"
        append-to-body
        custom-class="login-dialog-dark"
        :show-close="false">
      <div slot="title" class="login-dialog-header-dark"> <!-- ✨ 自定义头部 -->
        <span>欢迎回来</span>
        <i class="el-icon-close dialog-close-icon-dark" @click="handleCloseLog"></i>
      </div>
      <LoginView></LoginView>
    </el-dialog>

    <el-container class="main-layout">
      <!-- 左侧边栏 -->
      <el-aside width="200px" class="main-aside-dark"> <!-- ✨ 宽度调整，类名修改 -->
        <div class="aside-header-dark">
          <span class="logo-text-dark">MyAPP</span> <!-- ✨ Logo 文字调整 -->
        </div>
        <el-menu
            ref="elMenu"
            :default-active="$route.name"
            class="aside-menu-dark"
            background-color="transparent"
            text-color="#b0b3b8"
            active-text-color="#ffffff"
            router>
          <el-menu-item index="recommend" :route="{ name: 'recommend' }">
            <i class="el-icon-discover"></i>
            <span slot="title">发现</span> <!-- ✨ 文本调整 -->
          </el-menu-item>
          <el-menu-item index="follow" :route="{ name: 'follow' }">
            <i class="el-icon-star-off"></i>
            <span slot="title">关注</span>
          </el-menu-item>
          <el-menu-item index="user" :route="{ name: 'user',query:{id:'self'} }">
            <i class="el-icon-user"></i>
            <span slot="title">我</span> <!-- ✨ 文本调整 -->
          </el-menu-item>
        </el-menu>
        <div class="aside-footer-dark">
          <el-button type="text" icon="el-icon-setting" class="settings-btn-dark">设置</el-button>
        </div>
      </el-aside>

      <!-- 右侧主内容区容器 -->
      <el-container class="main-content-container-dark">
        <!-- 顶部栏 -->
        <el-header class="main-header-dark" height="60px">
          <div class="search-box-dark">
            <el-input
                placeholder="搜索精彩内容"
                v-model="input_search"
                class="search-input-dark"
                clearable
                @clear="clearSearch"
                @keyup.enter.native="clickSearch">
              <el-button slot="append" icon="el-icon-search" @click="clickSearch"
                         :disabled="!input_search.trim()"></el-button>
            </el-input>
          </div>

          <div class="header-actions-dark">
            <el-button type="primary" plain size="medium" icon="el-icon-upload2" @click="toCreator"
                       class="action-button-dark upload-btn-dark">发布
            </el-button>

            <el-popover placement="bottom-end" width="360" trigger="hover"
                        popper-class="action-popover-dark message-popover-dark" @show="handleOpenMessageView"
                        @hide="handleCloseMessageView">
              <div class="popover-content-dark" v-if="dialogVisible.messageView">
                <MessageView :existNewMessage="this.newMessage" v-on:checkNew="checkNew"
                             style="max-height: 400px; overflow-y: auto;"></MessageView>
              </div>
              <el-badge class="action-badge-dark" slot="reference" :is-dot="newMessage" :hidden="!newMessage">
                <el-button type="text" icon="el-icon-bell" class="action-icon-button-dark" title="通知"></el-button>
              </el-badge>
            </el-popover>

            <el-popover placement="bottom-end" width="400" trigger="hover"
                        popper-class="action-popover-dark chat-popover-dark">
              <div class="popover-content-dark">
                <ChatView style="max-height: 450px;"></ChatView>
              </div>
              <el-badge is-dot class="action-badge-dark" slot="reference" :hidden="true"> <!-- 示例：私信红点逻辑待实现 -->
                <el-button type="text" icon="el-icon-message" class="action-icon-button-dark" title="私信"></el-button>
              </el-badge>
            </el-popover>

            <div class="user-section-dark">
              <el-popover
                  v-if="isLogin"
                  placement="bottom-end"
                  width="280"
                  trigger="click"
                  popper-class="user-popover-dark">
                <template #reference>
                  <el-avatar :size="38"
                             :src="userinfo.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                             class="header-avatar-dark"></el-avatar>
                </template>
                <div class="user-popover-content-dark">
                  <div class="user-info-header-popover-dark">
                    <el-avatar :size="50"
                               :src="userinfo.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                               :key="userinfo.profile"></el-avatar>
                    <div class="user-info-text-popover-dark">
                      <span class="user-name-popover-dark">{{ userinfo.userName || '用户' }}</span>
                      <span class="user-id-popover-dark">ID: {{ userinfo.userId || '-' }}</span>
                    </div>
                  </div>
                  <div class="user-stats-popover-dark">
                    <div><span>{{ userinfo.subscriber || 0 }}</span><label>关注</label></div>
                    <el-divider direction="vertical"></el-divider>
                    <div><span>{{ userinfo.fans || 0 }}</span><label>粉丝</label></div>
<!--                    <div><span>{{ userinfo.likes || 0 }}</span><label>获赞</label></div> &lt;!&ndash; 假设有获赞数 &ndash;&gt;-->
                  </div>
                  <div class="user-actions-popover-dark">
                    <el-button type="text" @click="clickUser('self')"><i class="el-icon-user"></i>个人主页</el-button>
<!--                    <el-button type="text"><i class="el-icon-wallet"></i>我的钱包</el-button>
                    <el-button type="text"><i class="el-icon-setting"></i>账号设置</el-button>-->
                    <el-button type="text" @click="logout" class="logout-btn-popover-dark"><i
                        class="el-icon-switch-button"></i>退出登录
                    </el-button>
                  </div>
                </div>
              </el-popover>
              <el-button v-else type="primary" size="medium" @click="login" class="action-button-dark login-btn-dark">
                登录
              </el-button>
            </div>
          </div>
        </el-header>

        <el-main class="main-content-dark">
          <keep-alive>
            <router-view v-if="$route.meta.keepAlive" :key="$route.fullPath"/>
          </keep-alive>
          <router-view v-if="!$route.meta.keepAlive" :key="$route.fullPath"/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>



<style>
/* === THEME VARIABLES (CSS Custom Properties) === */
:root { /* 或者特定的主题类，如 .dark-theme */
  --theme-bg-color: #121212; /* 主要背景色 (深黑) */
  --primary-bg-color: #1e1e1e; /* 面板/卡片背景色 (次深黑) */
  --secondary-bg-color: #282828; /* 更浅的面板或交互元素背景 */
  --primary-text-color: #e0e0e0; /* 主要文字颜色 (浅灰) */
  --secondary-text-color: #a0a0a0; /* 次要文字/图标颜色 (中灰) */
  --accent-color: #FE2C55; /* 品牌强调色 (例如抖音红) */
  --border-color: #303030; /* 边框/分割线颜色 */

  /* 可选的其他变量 */
  --font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --base-font-size: 14px;
  --border-radius-base: 4px;
  --border-radius-large: 8px;
  --border-radius-round: 50%;
}

/* --- 主界面整体布局 --- */
.main-ui-container.dark-theme {
  height: 100vh;
  overflow: hidden;
  background-color: var(--theme-bg-color); /* 使用变量 */
  color: var(--primary-text-color);       /* 使用变量 */
  font-family: var(--font-family-sans-serif);
  font-size: var(--base-font-size);
}

.main-layout {
  height: 100%;
}

/* --- 左侧边栏样式 --- */
.main-aside-dark {
  background-color: var(--primary-bg-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  width: 200px;
}

.aside-header-dark {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0;
}

.logo-text-dark {
  font-size: 22px;
  font-weight: bold;
  color: var(--primary-text-color);
}

.aside-menu-dark { /* el-menu 样式通常需要 >>> 或 /deep/ 或 ::v-deep (如果scoped) */
  flex-grow: 1;
  border-right: none !important;
  overflow-y: auto;
  overflow-x: hidden;
  padding-top: 15px;
  background-color: transparent; /* el-menu 的背景由其父容器 .main-aside-dark 控制 */
}

/* 注意：Element UI 组件的内部样式修改，如果是在 scoped style 中，需要使用深度选择器 */
/* 如果这个CSS是全局的，可以直接用类名 */
.aside-menu-dark .el-menu-item {
  height: 48px;
  line-height: 48px;
  font-size: 15px;
  padding: 0 25px !important;
  transition: background-color 0.2s ease, color 0.2s ease;
  color: var(--secondary-text-color); /* 默认文字颜色 */
}

.aside-menu-dark .el-menu-item i {
  margin-right: 12px;
  font-size: 20px;
  width: 24px;
  text-align: center;
  color: var(--secondary-text-color); /* 默认图标颜色 */
}
.aside-menu-dark .el-menu-item span { /* Element UI menu item text is in a span */
  font-weight: 500;
}

.aside-menu-dark .el-menu-item.is-active {
  background-color: var(--accent-color) !important;
  color: #ffffff !important;
}
.aside-menu-dark .el-menu-item.is-active i {
  color: #ffffff !important;
}

.aside-menu-dark .el-menu-item:hover {
  background-color: var(--secondary-bg-color) !important;
  color: var(--primary-text-color) !important;
}
.aside-menu-dark .el-menu-item:hover i {
  color: var(--primary-text-color) !important;
}


.aside-footer-dark {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.aside-footer-dark .settings-btn-dark { /* el-button type="text" */
  color: var(--secondary-text-color);
  font-size: 14px;
  background-color: transparent;
  border: none;
}
.aside-footer-dark .settings-btn-dark:hover {
  color: var(--primary-text-color);
  background-color: var(--secondary-bg-color);
}
.aside-footer-dark .settings-btn-dark i {
  margin-right: 6px;
}


/* --- 右侧主内容区 --- */
.main-content-container-dark {
  background-color: var(--theme-bg-color);
}

.main-header-dark {
  background-color: var(--primary-bg-color);
  border-bottom: 1px solid var(--border-color);
  padding: 0 25px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px; /* 确保header有明确高度 */
}

.search-box-dark {
  flex-grow: 0;
  width: 350px;
  position: relative; /* For positioning search button if inside */
}

/* For search-input-dark and its ::v-deep parts */
.search-input-dark .el-input__inner {
  background-color: var(--secondary-bg-color);
  border: 1px solid var(--secondary-bg-color);
  color: var(--primary-text-color);
  border-radius: 25px;
  padding-left: 20px;
  padding-right: 40px; /* Make space for icon button if positioned inside */
  height: 38px;
  line-height: 38px;
}
.search-input-dark .el-input__inner:focus {
  border-color: var(--accent-color);
}
.search-input-dark .el-input__inner::placeholder {
  color: var(--secondary-text-color);
}
.search-input-dark .el-input-group__append { /* If using append slot */
  display: none; /* Hide default append slot if button is absolutely positioned */
}
.search-input-dark .el-button[slot="append"] { /* Custom search button */
  position: absolute;
  right: 5px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--secondary-text-color);
  font-size: 18px;
  padding: 6px;
  cursor: pointer;
}
.search-input-dark .el-button[slot="append"]:hover {
  color: var(--accent-color);
}
.search-input-dark .el-button[slot="append"].is-disabled {
  color: #6c757d; /* Darken secondary text color for disabled */
}


.header-actions-dark {
  display: flex;
  align-items: center;
}

.action-button-dark {
  margin-left: 15px;
  border-radius: 20px;
  font-weight: 500;
  padding: 9px 18px;
  border: 1px solid transparent; /* Base border */
}
.action-button-dark.upload-btn-dark {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}
.action-button-dark.upload-btn-dark:hover {
  background-color: #e02049; /* Lighten accent color */
  border-color: #e02049;
}
.action-button-dark.upload-btn-dark.is-plain {
  color: var(--accent-color);
  background: transparent;
  border-color: var(--accent-color);
}
.action-button-dark.upload-btn-dark.is-plain:hover {
  background: rgba(254, 44, 85, 0.1); /* Accent color with alpha */
}
.action-button-dark.login-btn-dark {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: #fff;
}
.action-button-dark.login-btn-dark:hover {
  background-color: #e02049;
  border-color: #e02049;
}

.action-icon-button-dark {
  font-size: 22px;
  color: var(--primary-text-color);
  margin: 0 10px;
  padding: 8px;
  transition: color 0.2s ease;
  background: none;
  border: none;
  cursor: pointer;
}
.action-icon-button-dark:hover {
  color: var(--accent-color);
}

.action-badge-dark {
  margin-left: 0;
  line-height: 1;
  vertical-align: middle;
  position: relative;
}
/* For Element UI Badge ::v-deep may be needed if scoped */
.action-badge-dark .el-badge__content.is-dot {
  background-color: var(--accent-color);
  width: 8px;
  height: 8px;
  position: absolute;
  top: 2px;
  right: 2px;
  border: 1px solid var(--primary-bg-color);
}
.action-badge-dark.is-hidden .el-badge__content.is-dot {
  display: none;
}


.user-section-dark {
  margin-left: 15px;
  display: flex;
  align-items: center;
}

.header-avatar-dark { /* el-avatar */
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
  width: 38px; /* Ensure size if not set by el-avatar prop */
  height: 38px;
  border-radius: var(--border-radius-round);
}
.header-avatar-dark:hover {
  border-color: var(--accent-color);
}


/* --- Popover 统一样式 (暗色) --- */
/* These classes target the popper itself, which is usually appended to body */
/* So, these should be global styles or use ::v-deep if this style block is scoped */
.el-popover.action-popover-dark,
.el-popover.user-popover-dark {
  background-color: var(--secondary-bg-color) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: var(--border-radius-large) !important;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  color: var(--primary-text-color);
  padding: 0 !important; /* Let content define padding */
}

.el-popover.action-popover-dark .popper__arrow,
.el-popover.user-popover-dark .popper__arrow {
  border-bottom-color: var(--secondary-bg-color) !important; /* Assuming bottom placement */
}
.el-popover.action-popover-dark .popper__arrow::after, /* Element UI < 2.15.7 */
.el-popover.user-popover-dark .popper__arrow::after {
  border-bottom-color: var(--secondary-bg-color) !important; /* Element UI < 2.15.7 */
}
/* For Element Plus or newer Element UI, arrow might be different */
.el-popper[x-placement^="bottom"].action-popover-dark .el-popper__arrow::before,
.el-popper[x-placement^="bottom"].user-popover-dark .el-popper__arrow::before {
  border-bottom-color: var(--border-color) !important; /* Arrow border */
}
.el-popper[x-placement^="bottom"].action-popover-dark .el-popper__arrow::after,
.el-popper[x-placement^="bottom"].user-popover-dark .el-popper__arrow::after {
  border-bottom-color: var(--secondary-bg-color) !important; /* Arrow fill */
}


/* User Info Popover Content (dark) */
.user-popover-dark .user-popover-content-dark {
  padding: 18px;
}
.user-popover-dark .user-info-header-popover-dark {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.user-popover-dark .user-info-header-popover-dark .el-avatar {
  width: 50px; height: 50px; border-radius: var(--border-radius-round);
}
.user-popover-dark .user-info-text-popover-dark {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}
.user-popover-dark .user-name-popover-dark {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 4px;
}
.user-popover-dark .user-id-popover-dark {
  font-size: 12px;
  color: var(--secondary-text-color);
}
.user-popover-dark .user-stats-popover-dark {
  font-size: 13px;
  color: var(--primary-text-color);
  display: flex;
  justify-content: space-around;
  margin-bottom: 18px;
  text-align: center;
}
.user-popover-dark .user-stats-popover-dark div {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-popover-dark .user-stats-popover-dark div span {
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}
.user-popover-dark .user-stats-popover-dark div label {
  font-size: 12px;
  color: var(--secondary-text-color);
}
.user-popover-dark .user-stats-popover-dark .el-divider--vertical {
  background-color: var(--border-color);
  height: 2em;
  margin: 0 10px;
  align-self: center;
}

.user-popover-dark .user-actions-popover-dark {
  display: flex;
  flex-direction: column;
}
.user-popover-dark .user-actions-popover-dark .el-button--text {
  padding: 10px 0;
  font-size: 14px;
  color: var(--primary-text-color);
  text-align: left;
  justify-content: flex-start; /* Align button content to start */
  border-radius: var(--border-radius-base);
  transition: background-color 0.2s ease;
  display: flex; /* To align icon and text */
  align-items: center;
}
.user-popover-dark .user-actions-popover-dark .el-button--text:hover {
  background-color: var(--secondary-bg-color);
  color: var(--primary-text-color);
}
.user-popover-dark .user-actions-popover-dark .el-button--text i {
  margin-right: 10px;
  font-size: 16px;
  color: var(--secondary-text-color);
  width: 16px; /* Fixed width for icon alignment */
  text-align: center;
}
.user-popover-dark .user-actions-popover-dark .logout-btn-popover-dark {
  color: var(--accent-color);
}
.user-popover-dark .user-actions-popover-dark .logout-btn-popover-dark i {
  color: var(--accent-color);
}
.user-popover-dark .user-actions-popover-dark .logout-btn-popover-dark:hover {
  background-color: rgba(254, 44, 85, 0.1); /* Accent color with alpha */
}


/* --- 右侧主内容区域 --- */
.main-content-dark {
  background-color: var(--theme-bg-color);
  padding: 0; /* Main content often doesn't need padding if router views handle it */
  height: calc(100vh - 60px); /* Full height minus header */
  overflow-y: auto;
}

/* --- 登录弹窗样式 (暗色) --- */
/* This class is applied to el-dialog via custom-class prop */
/* Styles for .el-dialog itself should be global or use ::v-deep */
.login-dialog-dark .el-dialog__header {
  display: none; /* Hide default header, use custom slot */
}
.login-dialog-dark .el-dialog__body {
  padding: 0; /* Let LoginView fill the body */
  background-color: var(--primary-bg-color); /* Ensure body bg matches */
  border-radius: 0 0 var(--border-radius-large) var(--border-radius-large); /* Match dialog border radius if header is custom */
}

/* Custom Dialog Header (dark) */
.login-dialog-header-dark {
  padding: 20px 25px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
  background-color: var(--primary-bg-color); /* Match dialog bg */
  border-radius: var(--border-radius-large) var(--border-radius-large) 0 0; /* Top corners rounded */
}
.dialog-close-icon-dark {
  cursor: pointer;
  color: var(--secondary-text-color);
  font-size: 20px;
}
.dialog-close-icon-dark:hover {
  color: var(--primary-text-color);
}

/* --- 滚动条美化 (暗色主题) --- */
.aside-menu-dark::-webkit-scrollbar,
.main-content-dark::-webkit-scrollbar,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar { /* Targeting popover's scrollable content */
  width: 6px;
}
.aside-menu-dark::-webkit-scrollbar-thumb,
.main-content-dark::-webkit-scrollbar-thumb,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
  background-color: var(--secondary-bg-color);
  border-radius: 3px;
}
.aside-menu-dark::-webkit-scrollbar-thumb:hover,
.main-content-dark::-webkit-scrollbar-thumb:hover,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
  background-color: #4a4a4a; /* Slightly lighter for hover */
}
.aside-menu-dark::-webkit-scrollbar-track,
.main-content-dark::-webkit-scrollbar-track,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
  background: transparent;
}

.aside-menu-dark,
.main-content-dark,
.el-popover.action-popover-dark div[style*="overflow-y: auto"] {
  scrollbar-width: thin;
  scrollbar-color: var(--secondary-bg-color) transparent;
}
</style>

