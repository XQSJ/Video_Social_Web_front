<script>
import Middle from '@/utils/middle.js';
import handleMainMenu from "@/utils/handleMainMenu";
import fromLogin from '@/utils/LoginViewToMainUIView';
import toLogin from '@/utils/toLogin'
import ChatView from "@/views/ChatView.vue";
import MessageView from "@/views/MessageView.vue";
import LoginView from "@/views/LoginView.vue";
import loginView from "@/views/LoginView.vue"; // 似乎与上面重复，可以考虑移除一个
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
      // button_Search_isDisable: true, // 这个似乎没有在模板中使用，可以考虑移除
      dialogVisible: {
        messageView: false,
        chatView: false, // chatView的显示逻辑似乎未在模板中明确使用dialogVisible控制
        logView: false,
      }
    }
  },
  watch: {},
  beforeMount() {
    let _this = this
    if (localStorage.getItem("isLogin") === null) {
      console.log("未登录");
      this.isLogin = false;
      _this.dialogVisible.logView = true;
    } else {
      console.log("已登录");
      this.isLogin = true;
      _this.dialogVisible.logView = false;
    }
  },
  async mounted() {
    let _this = this
    handleMainMenu.$on('openLogView',(data)=>{
      _this.handleOpenLog();
    })
    handleMainMenu.$on('closeLogView',(data)=>{
      _this.handleCloseLog();
    })
    fromLogin.$on('login', (data) => {
      _this.handleCloseLog();
      _this.isLogin = true;
    })
    toLogin.$on('log', (data) => {
      _this.login();
    })
    handleMainMenu.$on('cancel', () => {
      if (this.$refs.elMenu) { // 添加检查以防 $refs.elMenu 未定义
        this.$refs.elMenu.activeIndex = null;
      }
    })
    handleMainMenu.$on('user', () => {
      if (this.$refs.elMenu) { // 添加检查
        this.$refs.elMenu.activeIndex = 'user';
      }
    })
    handleMainMenu.$on('updateUserInfo',(data)=>{

      this.initUserInfo()
    })
    if (localStorage.getItem('userInfo') !== null) {
      this.initUserInfo()
    }

    if (this.userid !== -1) {
      this.timer = window.setInterval(() => {
        setTimeout(() => {
          // this.existNewMessages(); // 考虑在需要时调用，而不是固定轮询，或使用WebSocket
        }, 0)
      }, 3000);
    }
  },
  beforeDestroy() { // 组件销毁前清除定时器
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  methods: {
    initUserInfo(){
      let _this = this
      _this.userinfo = JSON.parse(localStorage.getItem('userInfo'));
      let avatarPath = this.userinfo.avatar; // 使用更明确的变量名

      if (avatarPath) { // 确保头像路径存在
        axios.get(`/image/getUrl/${avatarPath}`).then((response) => {
          if (response.data && response.data.data) { // 检查响应数据
            _this.userinfo.profile = response.data.data;
            this.$forceUpdate(); // 谨慎使用 $forceUpdate，通常 Vue 的响应式系统会自动处理
          }
        }).catch(error => {
          console.error("获取头像URL失败:", error);
        });
      }
      this.userid = this.userinfo.userId; // 直接从已解析的 userinfo 获取
    },
    existNewMessages() {
      if (this.dialogVisible.messageView === false && this.userid !== -1) { // 确保userid有效
        axios.get(`/message/exist/${this.userid}`).then((response) => {
          if (response.data && response.data.code === 1) {
            this.newMessage = response.data.data;
          }
        }).catch(error => {
          console.error("检查新消息失败:", error);
        });
      }
    },
    test(a) {
      console.log("测试功能触发，参数：" + a); // 中文日志
      this.$router.push({name: 'recommend'}).catch(err => {
        if (err.name !== 'NavigationDuplicated') console.error(err);
      });
    },
    toCreator() {

      if(this.userid===-1){
        this.dialogVisible.logView = true; // 登出后显示登录框
      }else{
        this.$router.push({name: 'creator'}).catch(err => { // 添加错误捕获
          if (err.name !== 'NavigationDuplicated') {
            console.error(err);
          }
        });
      }

    },
    logout() {
      this.isLogin = false;
      localStorage.clear();
      this.$router.go(0); // 强制刷新页面体验可能不佳，考虑其他方式重置状态
      // 可能需要将用户重定向到登录页或首页
      this.$router.push({ name: 'recommend' }).catch(err => {
        if (err.name !== 'NavigationDuplicated') console.error(err);
      });
      this.dialogVisible.logView = true; // 登出后显示登录框

    },
    login() {
      this.dialogVisible.logView = true;
    },
    handleOpenLog() {
      this.dialogVisible.logView = true;
    },
    handleCloseLog() {
      this.dialogVisible.logView = false;
    },
    checkNew() {
      this.newMessage = false;
    },
    handleOpenMessageView() {
      this.dialogVisible.messageView = true;
      // 打开消息视图时可以调用一次 existNewMessages 来刷新
      this.existNewMessages();
    },
    handleCloseMessageView() {
      this.dialogVisible.messageView = false;
    },
    clickUser(user_id) {
      this.toUserView(user_id); // 假设 toUserView 是全局混入或原型上的方法
    },

    clearSearch() {

    },
    clickSearch() {
      const searchTerm = this.input_search.trim();
      if (searchTerm === '') {
        this.$message.info('请输入搜索关键词');
        return;
      }

      const currentRoute = this.$route;
      let currentSearchType = 'video'; // 默认搜索类型
      if (currentRoute.name === 'search' && currentRoute.query.type) {
        currentSearchType = currentRoute.query.type;
      }

        const targetRoute = {
          name: 'search',
          query: {
            key: searchTerm,
            type: currentSearchType // 将当前或默认类型带过去
          }
        };
      // 检查是否需要导航
      if (
          currentRoute.name === targetRoute.name &&
          currentRoute.query.key === targetRoute.query.key &&
          currentRoute.query.type === targetRoute.query.type
      ) {
        // 如果已经在搜索页且所有参数都相同，可能意味着用户想用相同的词刷新
        // 此时，SearchView 内部的 watch 可能不会触发（因为 query 没变）
        // 可以通过事件总线强制 SearchView 刷新，或者 SearchView 监听一个特定的“强制刷新”事件
        console.log("MainUI: 已经在搜索页且参数相同，考虑是否需要强制刷新");
        Middle.$emit('forceSearchRefresh', { key: searchTerm, type: currentSearchType  }); // 发出一个不同的事件
      } else {
        this.$router.push(targetRoute).catch(err => {
          if (err.name !== 'NavigationDuplicated') {
            console.error("Router push error from MainUI:", err);
          }
        });
      }



    }
  }
}
</script>

<template>
  <!-- 主界面根容器 -->
  <div class="main-ui-container dark-theme"> <!-- ✨ 应用深色主题类 -->
    <!-- 登录弹窗 (样式将通过 custom-class 调整) -->
    <el-dialog
        :visible.sync="dialogVisible.logView"
        :before-close="handleCloseLog"
        :close-on-click-modal="false"
        width="380px"
        append-to-body
        custom-class="login-dialog-dark"
        :show-close="false">
      <div slot="title" class="login-dialog-header-dark"> <!-- ✨ 自定义深色主题头部 -->
        <span>欢迎回来</span>
      </div>
      <LoginView></LoginView>
    </el-dialog>

    <el-container class="main-layout">
      <!-- 左侧边栏 -->
      <el-aside width="200px" class="main-aside-dark"> <!-- ✨ 深色主题侧边栏，宽度调整 -->
        <div class="aside-header-dark">
          <span class="logo-text-dark">我的应用</span> <!-- ✨ Logo 文字内容 -->
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
            <span slot="title">发现</span> <!-- ✨ 菜单项文本 -->
          </el-menu-item>
          <el-menu-item index="follow" :route="{ name: 'follow' }">
            <i class="el-icon-star-off"></i>
            <span slot="title">关注</span>
          </el-menu-item>
          <el-menu-item index="user" :route="{ name: 'user',query:{id:'self'} }" >
            <i class="el-icon-user"></i>
            <span slot="title">我</span> <!-- ✨ 菜单项文本 -->
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
                placeholder="搜索精彩内容..."
                v-model="input_search"
                class="search-input-dark"
                clearable
                @clear="clearSearch"
                @keyup.enter.native="clickSearch">
              <el-button slot="append" icon="el-icon-search" @click="clickSearch"
                         :disabled="!input_search.trim()" title="搜索"></el-button>
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
                <MessageView :existNewMessage="newMessage" @checkNew="checkNew"
                             style="max-height: 400px; overflow-y: auto;"></MessageView>
              </div>
              <el-badge class="action-badge-dark" slot="reference" :is-dot="newMessage" :hidden="!newMessage">
                <el-button type="text" icon="el-icon-bell" class="action-icon-button-dark" title="通知"></el-button>
              </el-badge>
            </el-popover>

<!--            <el-popover placement="bottom-end" width="400" trigger="hover"
                        popper-class="action-popover-dark chat-popover-dark">
              <div class="popover-content-dark">
                <ChatView style="max-height: 450px; overflow-y: auto;"></ChatView> &lt;!&ndash; 建议ChatView也处理滚动 &ndash;&gt;
              </div>
              <el-badge is-dot class="action-badge-dark" slot="reference" :hidden="true"> &lt;!&ndash; 示例：私信红点逻辑待实现 &ndash;&gt;
                <el-button type="text" icon="el-icon-message" class="action-icon-button-dark" title="私信"></el-button>
              </el-badge>
            </el-popover>-->

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
                             class="header-avatar-dark"
                             alt="用户头像"></el-avatar>
                </template>
                <div class="user-popover-content-dark">
                  <div class="user-info-header-popover-dark">
                    <el-avatar :size="50"
                               :src="userinfo.profile || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
                               :key="userinfo.profile" alt="用户头像"></el-avatar>
                    <div class="user-info-text-popover-dark">
                      <span class="user-name-popover-dark">{{ userinfo.userName || ' ' }}</span>
                      <span class="user-id-popover-dark">ID: {{ userinfo.userId || '---' }}</span>
                    </div>
                  </div>
                  <div class="user-stats-popover-dark">
                    <div><span>{{ userinfo.subscriber || 0 }}</span><label>关注</label></div>
                    <el-divider direction="vertical"></el-divider>
                    <div><span>{{ userinfo.fans || 0 }}</span><label>粉丝</label></div>
                    <!-- 示例：获赞数 (若有此数据)
                    <el-divider direction="vertical" v-if="userinfo.likes !== undefined"></el-divider>
                    <div v-if="userinfo.likes !== undefined"><span>{{ userinfo.likes }}</span><label>获赞</label></div>
                    -->
                  </div>
                  <div class="user-actions-popover-dark">
                    <el-button type="text" @click="clickUser('self')"><i class="el-icon-user"></i>个人主页</el-button>
                    <!-- 示例：其他操作
                    <el-button type="text"><i class="el-icon-wallet"></i>我的钱包</el-button>
                    <el-button type="text"><i class="el-icon-setting"></i>账号设置</el-button>
                    -->
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
/* === 主题变量 (CSS 自定义属性) === */
:root { /* 或者特定的主题类, 例如 .dark-theme */
  --theme-bg-color: #121212; /* 主要背景色 (深黑) */
  --primary-bg-color: #1e1e1e; /* 面板/卡片背景色 (次深黑) */
  --secondary-bg-color: #282828; /* 更浅的面板或交互元素背景 (例如输入框) */
  --tertiary-bg-color: #333333; /* 用于细微区分的背景色 */
  --primary-text-color: #e0e0e0; /* 主要文字颜色 (浅灰) */
  --secondary-text-color: #a0a0a0; /* 次要文字/图标颜色 (中灰) */
  --accent-color: #FE2C55; /* 品牌强调色 (例如抖音红) */
  --accent-color-darker: #e02049; /* 用于强调色的悬停/激活状态 */
  --accent-color-light-text: #ffffff; /* 强调色背景上的文字颜色 */
  --accent-color-hover-bg: rgba(254, 44, 85, 0.08); /* 用于朴素/文字按钮的强调色悬停背景 */
  --border-color: #303030; /* 边框/分割线颜色 */
  --border-color-light: #444444; /* 稍浅的边框色, 用于聚焦/悬停 */
  --success-color: #28a745; /* 成功状态颜色 */
  --warning-color: #ffc107; /* 警告状态颜色 */
  --danger-color: #dc3545; /* 危险状态颜色 */

  --font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; /* 系统默认字体栈 */
  --base-font-size: 14px; /* 基础字号 */
  --border-radius-small: 3px; /* 小圆角 */
  --border-radius-base: 4px; /* 基础圆角 */
  --border-radius-medium: 6px; /* 中等圆角 (用于按钮, 输入框) */
  --border-radius-large: 8px; /* 大圆角 (用于卡片, 对话框) */
  --border-radius-xl: 12px; /* 超大圆角 */
  --border-radius-round: 50%; /* 圆形 */

  --input-height: 38px; /* 输入框标准高度 */
}

/* --- 全局重置与基础样式 --- */
body.dark-theme { /* 如果将 dark-theme 应用于 body 标签 */
  background-color: var(--theme-bg-color);
  color: var(--primary-text-color);
  margin: 0; /* 移除默认 body margin */
}

/* --- 主界面整体布局 --- */
.main-ui-container.dark-theme {
  height: 100vh; /* 占满视窗高度 */
  overflow: hidden; /* 防止主容器出现滚动条 */
  background-color: var(--theme-bg-color);
  color: var(--primary-text-color);
  font-family: var(--font-family-sans-serif);
  font-size: var(--base-font-size);
}

.main-layout {
  height: 100%; /* 继承父容器高度 */
}

/* --- 左侧边栏样式 --- */
.main-aside-dark {
  background-color: var(--primary-bg-color);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  width: 200px; /* 固定宽度 */
}

.aside-header-dark {
  height: 60px; /* 头部高度 */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
  flex-shrink: 0; /* 防止头部在内容过多时被压缩 */
}

.logo-text-dark {
  font-size: 22px;
  font-weight: 700; /* 加粗Logo文字 */
  color: var(--primary-text-color);
  letter-spacing: 0.5px; /* 轻微字间距 */
}

.aside-menu-dark { /* Element UI 菜单样式 */
  flex-grow: 1; /* 占据剩余空间 */
  border-right: none !important; /* 移除 Element UI 默认的右边框 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
  padding-top: 10px; /* 顶部留白 */
  background-color: transparent; /* 菜单背景由父容器控制 */
}

.aside-menu-dark .el-menu-item {
  height: 46px; /* 菜单项高度 */
  line-height: 46px; /* 垂直居中文本 */
  font-size: 14px; /* 标准化字号 */
  padding: 0 20px !important; /* 调整内边距 */
  transition: background-color 0.2s ease, color 0.2s ease; /* 平滑过渡效果 */
  color: var(--secondary-text-color); /* 默认文字颜色 */
  border-radius: var(--border-radius-medium); /* 中等圆角 */
  margin: 4px 8px; /* 菜单项之间的外边距 */
  width: calc(100% - 16px); /* 根据外边距调整宽度以充满 */
}

.aside-menu-dark .el-menu-item i { /* 菜单项图标 */
  margin-right: 10px; /* 图标与文字间距 */
  font-size: 18px; /* 标准化图标大小 */
  width: 20px; /* 固定图标宽度以对齐 */
  text-align: center; /* 图标居中 */
  color: var(--secondary-text-color); /* 默认图标颜色 */
  transition: color 0.2s ease; /* 图标颜色过渡 */
}
.aside-menu-dark .el-menu-item span { /* 菜单项文字 */
  font-weight: 500; /* 适中字重 */
}

.aside-menu-dark .el-menu-item.is-active { /* 激活状态的菜单项 */
  background-color: var(--accent-color) !important; /* 使用强调色背景 */
  color: var(--accent-color-light-text) !important; /* 强调色背景上的文字颜色 */
  box-shadow: 0 2px 8px rgba(254, 44, 85, 0.2); /* 轻微阴影提升层次感 */
}
.aside-menu-dark .el-menu-item.is-active i {
  color: var(--accent-color-light-text) !important; /* 激活时图标颜色 */
}

.aside-menu-dark .el-menu-item:hover:not(.is-active) { /* 未激活菜单项的悬停状态 */
  background-color: var(--secondary-bg-color) !important;
  color: var(--primary-text-color) !important;
}
.aside-menu-dark .el-menu-item:hover:not(.is-active) i {
  color: var(--primary-text-color) !important;
}

.aside-footer-dark { /* 侧边栏底部 */
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
  padding: 0 8px; /* 底部内边距 */
}

.aside-footer-dark .settings-btn-dark { /* 底部设置按钮 */
  color: var(--secondary-text-color);
  font-size: 14px;
  background-color: transparent;
  border: none;
  padding: 8px 12px;
  border-radius: var(--border-radius-medium);
  width: 100%; /* 按钮充满底部区域 */
  text-align: left; /* 文字左对齐 */
}
.aside-footer-dark .settings-btn-dark:hover {
  color: var(--primary-text-color);
  background-color: var(--secondary-bg-color);
}
.aside-footer-dark .settings-btn-dark i {
  margin-right: 8px; /* 设置图标与文字间距 */
}

/* --- 右侧主内容区 --- */
.main-content-container-dark {
  background-color: var(--theme-bg-color);
}

.main-header-dark { /* 顶部栏 */
  background-color: var(--primary-bg-color);
  border-bottom: 1px solid var(--border-color);
  padding: 0 24px; /* 统一内边距 */
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px; /* 固定高度 */
}

/* --- 搜索框优化 --- */
.search-box-dark {
  width: 320px; /* 调整宽度 */
  position: relative; /* 便于内部元素定位 */
}

.search-input-dark .el-input__inner { /* Element UI 输入框内部样式 */
  background-color: var(--secondary-bg-color);
  border: 1px solid var(--border-color); /* 默认边框颜色 */
  color: var(--primary-text-color);
  border-radius: var(--border-radius-medium); /* 中等圆角 */
  padding-left: 15px; /* 左内边距 */
  padding-right: 40px; /* 右内边距, 为搜索按钮腾出空间 */
  height: var(--input-height);
  line-height: var(--input-height);
  font-size: 14px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease; /* 平滑过渡 */
}
.search-input-dark .el-input__inner:focus { /* 输入框聚焦时 */
  border-color: var(--accent-color); /* 使用强调色边框 */
  box-shadow: 0 0 0 2px rgba(254, 44, 85, 0.2); /* 添加聚焦光晕效果 */
}
.search-input-dark .el-input__inner::placeholder { /* 占位符文字颜色 */
  color: var(--secondary-text-color);
  opacity: 0.8; /* 略微透明 */
}

.search-input-dark .el-input-group__append { /* Element UI 默认的 append 插槽 */
  /*display: none;*/ /* 隐藏, 因为我们将按钮绝对定位 */

}
.search-input-dark .el-button[slot="append"] { /* 自定义搜索按钮 */
  position: absolute;
  right: 1px; /* 对齐输入框右边框 */
  top: 1px; /* 对齐输入框上边框 */
  bottom: 1px; /* 对齐输入框下边框 */
  width: 36px; /* 固定按钮宽度 */
  background: transparent; /* 透明背景 */
  border: none; /* 无边框 */
  color: var(--secondary-text-color); /* 默认图标颜色 */
  font-size: 16px; /* 图标大小 */
  padding: 0; /* 无内边距 */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0 var(--border-radius-medium) var(--border-radius-medium) 0; /* 右侧圆角 */
  transition: color 0.2s ease;
  cursor: pointer;
}
.search-input-dark .el-button[slot="append"]:hover:not(:disabled) { /* 按钮悬停 (非禁用时) */
  color: var(--accent-color); /* 使用强调色 */
}
.search-input-dark .el-button[slot="append"]:disabled { /* 禁用状态 */
  color: #555; /* 深灰色 */
  cursor: not-allowed; /* 禁用鼠标样式 */
}
.search-input-dark .el-input__clear { /* Element UI 清除按钮样式 */
  color: var(--secondary-text-color);
  font-size: 15px;
  /* 确保清除按钮不与搜索图标重叠, 根据实际情况调整 */
  /*margin-right: 35px;*/
}
.search-input-dark .el-input__clear:hover {
  color: var(--primary-text-color);
}

/* --- 顶部操作按钮区 --- */
.header-actions-dark {
  display: flex;
  align-items: center;
  gap: 12px; /* 操作项之间的间距 */
}

/* 操作按钮基础样式 (例如 "发布", "登录") */
.action-button-dark {
  border-radius: var(--border-radius-medium); /* 中等圆角 */
  font-weight: 500; /* 适中字重 */
  font-size: 14px;
  padding: 0 18px; /* 左右内边距 */
  height: calc(var(--input-height) - 2px); /* 高度略小于输入框以视觉平衡 */
  line-height: calc(var(--input-height) - 2px); /* 垂直居中 */
  border: 1.5px solid transparent; /* 默认透明边框, 便于悬停/聚焦时添加颜色 */
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

/* "发布" 按钮优化 (朴素主要按钮) */
.action-button-dark.upload-btn-dark.el-button--primary.is-plain {
  color: var(--accent-color);
  background: transparent;
  border-color: var(--accent-color);
}
.action-button-dark.upload-btn-dark.el-button--primary.is-plain:hover,
.action-button-dark.upload-btn-dark.el-button--primary.is-plain:focus {
  background: var(--accent-color-hover-bg); /* 使用强调色悬停背景 */
  color: var(--accent-color-darker); /* 悬停时文字颜色加深 */
  border-color: var(--accent-color-darker); /* 悬停时边框颜色加深 */
}

/* "登录" 按钮 (主要按钮) */
.action-button-dark.login-btn-dark.el-button--primary {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: var(--accent-color-light-text);
}
.action-button-dark.login-btn-dark.el-button--primary:hover,
.action-button-dark.login-btn-dark.el-button--primary:focus {
  background-color: var(--accent-color-darker); /* 悬停/聚焦时背景色加深 */
  border-color: var(--accent-color-darker);
  box-shadow: 0 2px 6px rgba(254, 44, 85, 0.25); /* 添加轻微阴影 */
}

/* 图标按钮优化 (例如 "通知", "私信") */
.action-icon-button-dark.el-button--text {
  font-size: 20px; /* 图标大小 */
  color: var(--secondary-text-color); /* 默认颜色 */
  padding: 7px; /* 使点击区域为方形 */
  margin: 0; /* 移除 Element UI 文本按钮的默认外边距 */
  border-radius: var(--border-radius-round); /* 圆形 */
  background: transparent; /* 透明背景 */
  border: none; /* 无边框 */
  line-height: 1; /* 重要: 用于图标垂直居中 */
  transition: color 0.2s ease, background-color 0.2s ease;
}
.action-icon-button-dark.el-button--text:hover,
.action-icon-button-dark.el-button--text:focus {
  color: var(--primary-text-color); /* 悬停/聚焦时图标颜色 */
  background-color: var(--secondary-bg-color); /* 轻微背景反馈 */
}

.action-badge-dark { /* Element UI 徽标点 */
  margin-left: 0; /* 根据实际布局调整 */
  line-height: 1;
  vertical-align: middle;
  position: relative;
}
.action-badge-dark .el-badge__content.is-dot { /* 徽标点具体样式 */
  background-color: var(--accent-color);
  width: 8px;
  height: 8px;
  position: absolute; /* 相对于其引用的按钮定位 */
  top: 2px; /* 微调位置 */
  right: 2px; /* 微调位置 */
  border: 1px solid var(--primary-bg-color); /* 与背景色区分的边框 */
}
.action-badge-dark.is-hidden .el-badge__content.is-dot { /* 隐藏状态 */
  display: none;
}

.user-section-dark { /* 用户头像区域 */
  margin-left: 15px; /* 与其他操作项的间距 */
  display: flex;
  align-items: center;
}

.header-avatar-dark { /* Element UI 头像 */
  cursor: pointer;
  border: 2px solid transparent; /* 默认透明边框 */
  transition: border-color 0.2s ease;
  width: 38px; /* 确保尺寸 */
  height: 38px;
  border-radius: var(--border-radius-round); /* 圆形 */
}
.header-avatar-dark:hover {
  border-color: var(--accent-color); /* 悬停时显示强调色边框 */
}

/* --- Popover 浮层统一样式 (深色) --- */
/* 这些类针对浮层本身, 通常附加到 body, 所以应为全局样式或使用 ::v-deep (若在 scoped style 中) */
.el-popover.action-popover-dark,
.el-popover.user-popover-dark {
  background-color: var(--secondary-bg-color) !important; /* 背景色 */
  border: 1px solid var(--border-color) !important; /* 边框色 */
  border-radius: var(--border-radius-large) !important; /* 大圆角 */
  box-shadow: 0 5px 15px rgba(0,0,0,0.3); /* 阴影 */
  color: var(--primary-text-color); /* 文字颜色 */
  padding: 0 !important; /* 让内容区域自己定义内边距 */
}

/* Popover 箭头样式 (兼容 Element UI 不同版本) */
.el-popover.action-popover-dark .popper__arrow,
.el-popover.user-popover-dark .popper__arrow,
.el-popover.action-popover-dark .popper__arrow::after, /* Element UI < 2.15.7 */
.el-popover.user-popover-dark .popper__arrow::after {
  border-bottom-color: var(--secondary-bg-color) !important; /* 假设底部弹出 */
}
/* Element Plus 或较新 Element UI 的箭头 */
.el-popper[x-placement^="bottom"].action-popover-dark .el-popper__arrow::before,
.el-popper[x-placement^="bottom"].user-popover-dark .el-popper__arrow::before {
  border-bottom-color: var(--border-color) !important; /* 箭头边框 */
}
.el-popper[x-placement^="bottom"].action-popover-dark .el-popper__arrow::after,
.el-popper[x-placement^="bottom"].user-popover-dark .el-popper__arrow::after {
  border-bottom-color: var(--secondary-bg-color) !important; /* 箭头填充 */
}

/* Popover 内容区域特定样式 */
.popover-content-dark {
  /* 例如 MessageView 和 ChatView 的容器 */
  padding: 10px; /* 如果需要统一内边距 */
}

/* 用户信息 Popover 内容 (深色) */
.user-popover-dark .user-popover-content-dark {
  padding: 18px; /* Popover 内部的整体内边距 */
}
.user-popover-dark .user-info-header-popover-dark { /* 头部用户信息 */
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.user-popover-dark .user-info-header-popover-dark .el-avatar { /* Popover 内的头像 */
  width: 50px; height: 50px; border-radius: var(--border-radius-round);
}
.user-popover-dark .user-info-text-popover-dark { /* 用户名和ID区域 */
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}
.user-popover-dark .user-name-popover-dark { /* 用户名 */
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 4px;
}
.user-popover-dark .user-id-popover-dark { /* 用户ID */
  font-size: 12px;
  color: var(--secondary-text-color);
}
.user-popover-dark .user-stats-popover-dark { /* 用户数据统计 (关注/粉丝) */
  font-size: 13px;
  color: var(--primary-text-color);
  display: flex;
  justify-content: space-around;
  margin-bottom: 18px;
  text-align: center;
}
.user-popover-dark .user-stats-popover-dark div { /* 单个数据项 */
  display: flex;
  flex-direction: column;
  align-items: center;
}
.user-popover-dark .user-stats-popover-dark div span { /* 数据数字 */
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 2px;
}
.user-popover-dark .user-stats-popover-dark div label { /* 数据标签 (关注/粉丝) */
  font-size: 12px;
  color: var(--secondary-text-color);
}
.user-popover-dark .user-stats-popover-dark .el-divider--vertical { /* 分割线 */
  background-color: var(--border-color);
  height: 2em; /* 根据内容调整高度 */
  margin: 0 10px; /* 左右外边距 */
  align-self: center; /* 垂直居中 */
}

.user-popover-dark .user-actions-popover-dark { /* 用户操作按钮列表 */
  display: flex;
  flex-direction: column;
}
.user-popover-dark .user-actions-popover-dark .el-button--text { /* 操作按钮 */
  padding: 10px 0;
  font-size: 14px;
  color: var(--primary-text-color);
  text-align: left;
  justify-content: flex-start; /* 使按钮内容左对齐 */
  border-radius: var(--border-radius-base); /* 基础圆角 */
  transition: background-color 0.2s ease;
  display: flex; /* 用于对齐图标和文字 */
  align-items: center;
}
.user-popover-dark .user-actions-popover-dark .el-button--text:hover {
  background-color: var(--tertiary-bg-color); /* 更轻微的悬停背景 */
  color: var(--primary-text-color);
}
.user-popover-dark .user-actions-popover-dark .el-button--text i { /* 操作按钮图标 */
  margin-right: 10px;
  font-size: 16px;
  color: var(--secondary-text-color);
  width: 16px; /* 固定图标宽度以对齐 */
  text-align: center;
}
.user-popover-dark .user-actions-popover-dark .logout-btn-popover-dark { /* 退出登录按钮 */
  color: var(--accent-color);
}
.user-popover-dark .user-actions-popover-dark .logout-btn-popover-dark i {
  color: var(--accent-color);
}
.user-popover-dark .user-actions-popover-dark .logout-btn-popover-dark:hover {
  background-color: var(--accent-color-hover-bg); /* 使用强调色悬停背景 */
}

/* --- 右侧主内容区域 (router-view) --- */
.main-content-dark {
  background-color: var(--theme-bg-color);
  padding: 0; /* 主内容区域通常不需要内边距, 由路由视图自行处理 */
  height: calc(100vh - 60px); /* 占满除顶部栏外的剩余高度 */
  overflow-y: auto; /* 内容超出时显示滚动条 */
}

/* --- 登录弹窗样式 (深色) --- */
/* 此类通过 custom-class 属性应用于 el-dialog */
/* el-dialog 本身的样式需要全局或使用 ::v-deep */
.login-dialog-dark.el-dialog { /* 确保 custom-class 生效于 el-dialog 根元素 */
  background-color: var(--primary-bg-color); /* 对话框背景 */
  border-radius: var(--border-radius-large); /* 大圆角 */
  box-shadow: 0 8px 25px rgba(0,0,0,0.4); /* 更明显的阴影 */
}
.login-dialog-dark .el-dialog__header {
  display: none; /* 隐藏 Element UI 默认头部, 使用自定义 slot */
}
.login-dialog-dark .el-dialog__body {
  padding: 0; /* 让 LoginView 组件填充整个主体区域 */
  background-color: var(--primary-bg-color); /* 确保主体背景色一致 */
  /* 如果自定义头部有圆角, 主体也需要匹配底部圆角 */
  border-radius: 0 0 var(--border-radius-large) var(--border-radius-large);
}

/* 自定义登录弹窗头部 (深色) */
.login-dialog-header-dark {
  padding: 20px 25px; /* 内边距 */
  border-bottom: 1px solid var(--border-color); /* 底部边框 */
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px; /* 标题字号 */
  font-weight: 600; /* 标题字重 */
  color: var(--primary-text-color); /* 标题颜色 */
  background-color: var(--primary-bg-color); /* 与对话框背景一致 */
  /* 匹配对话框的顶部圆角 */
  border-radius: var(--border-radius-large) var(--border-radius-large) 0 0;
}
.dialog-close-icon-dark { /* 关闭图标 */
  cursor: pointer;
  color: var(--secondary-text-color);
  font-size: 20px;
}
.dialog-close-icon-dark:hover {
  color: var(--primary-text-color); /* 悬停时颜色变亮 */
}

/* --- 滚动条美化 (深色主题) --- */
/* 适用于 Webkit 内核浏览器 (Chrome, Safari, Edge 新版) */
.aside-menu-dark::-webkit-scrollbar,
.main-content-dark::-webkit-scrollbar,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar,
.el-popover.chat-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar { /* 针对 Popover 内部可能滚动的 div */
  width: 6px; /* 滚动条宽度 */
}
.aside-menu-dark::-webkit-scrollbar-thumb,
.main-content-dark::-webkit-scrollbar-thumb,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb,
.el-popover.chat-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb {
  background-color: var(--secondary-bg-color); /* 滑块颜色 */
  border-radius: 3px; /* 滑块圆角 */
}
.aside-menu-dark::-webkit-scrollbar-thumb:hover,
.main-content-dark::-webkit-scrollbar-thumb:hover,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover,
.el-popover.chat-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-thumb:hover {
  background-color: #4a4a4a; /* 悬停时滑块颜色变亮 */
}
.aside-menu-dark::-webkit-scrollbar-track,
.main-content-dark::-webkit-scrollbar-track,
.el-popover.action-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-track,
.el-popover.chat-popover-dark div[style*="overflow-y: auto"]::-webkit-scrollbar-track {
  background: transparent; /* 轨道背景透明 */
}

/* 适用于 Firefox 浏览器 */
.aside-menu-dark,
.main-content-dark,
.el-popover.action-popover-dark div[style*="overflow-y: auto"],
.el-popover.chat-popover-dark div[style*="overflow-y: auto"] {
  scrollbar-width: thin; /* "thin" 或 "auto" */
  scrollbar-color: var(--secondary-bg-color) transparent; /* 滑块颜色 轨道颜色 */
}
</style>