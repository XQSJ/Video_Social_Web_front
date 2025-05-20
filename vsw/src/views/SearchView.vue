<script>
import Middle from '@/utils/middle.js';
import axios from "axios";
import PlayerView from "@/views/PlayerView.vue";

export default {
  components: {PlayerView},
  data() {
    return {
      videoId:"",
      dialogFormVisible:false,
      searchKeyword: this.$route.query.key || '',     // ✨ 初始化时从路由获取
      searchType: this.$route.query.type || 'video', // ✨ 初始化时从路由获取，或默认
      loading:false,
      results: {
        users: [],
        videos: []
      },
      firstSearchAttempted:false,
      defaultAvatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png' // 默认头像
    }
  },
  methods: {
    fetchInitialVideosForPlayerView() {
      return [
        {"videoId": this.videoId}
      ]

    },
    fetchMoreVideosForPlayerView(currentListLength) {

    },
    handleToUserButton(userId){

      this.toUserView(userId)
    },
    back() { //返回上一个界面

      this.$router.go(-1)
    },
    changeType(type) { //更改type时调用
      console.log(type)
      //更改路由
      if (this.searchType === type) return; // 类型未改变，不操作

      // 更新路由的 type 参数，这将自动触发 watch 中的 executeSearch
      this.$router.push({
        name: 'search',
        query: {
          key: this.searchKeyword,  // 保留其他 query 参数，如 key
          type: type
        }
      }).catch(err => {
        if (err.name !== 'NavigationDuplicated') {
          console.error("Router push error from SearchView (changeType):", err);
        }
      });
    },
      //!!!执行数据调用


    showVideoDialog(videoId){
      this.videoId=videoId
      this.dialogFormVisible = true;
    },
    closeVideoDialog(){
      this.dialogFormVisible = false;
    },
    Search() { //执行搜索
      console.log("sousuo" + this.searchKeyword + this.searchType)
      if(this.loading === false)
      {
        this.loading = true;
        let url = "/search/"
        let afterPath = 'user'
         switch(this.searchType){
           case 'user' :{
             afterPath= 'user'
             break
           }
           case 'video' :{
             afterPath = 'video'
             break
           }
           default:{
             afterPath = 'video'
           }
         }
        url += afterPath
        try {
          axios.post(url + '/' + this.searchKeyword).then((response) => {
            if (response.data.code === 1) {
              console.log(response.data.data)
              this.firstSearchAttempted = true;
              switch (this.searchType) {
                case 'user' : {
                  this.results.users = response.data.data
                  break;
                }
                case 'video':{
                  this.results.videos = response.data.data
                }
              }

            } else {
              this.results = {users: [], videos: []};
              this.$message.error(response.data.msg || '搜索失败');
            }
            setTimeout(()=>{
              this.loading = false;
            },500)
          })
        } catch (error) {
          this.results = {users: [], videos: []};
          console.error("搜索请求失败:", error);
          this.$message.error('搜索请求异常');
        } finally {


        }
      }
    }
  },
  beforeMount() {

  },
  mounted() {
    Middle.$on('forceSearchRefresh', (params) => {
      // 确保当前确实在搜索页，并且事件是针对当前搜索状态的（可选，但更健壮）
      if (this.$route.name === 'search') {
        console.log("SearchView: 收到 forceSearchRefresh 事件，参数:", params);
        this.results = {users: [], videos: []};
        // 更新内部状态（如果事件传递了新参数，尽管在此场景下参数通常是相同的）
        // this.searchKeyword = params.key;
        // this.searchType = params.type;
        // 然后直接调用搜索方法
        this.Search(); // 使用当前组件状态的 searchKeyword 和 searchType
      }
    });
    // ✨ 组件挂载时，如果路由中已有参数，主动执行一次搜索
    if (this.searchKeyword.trim()) {
      console.log("SearchView: Initial search on mount for keyword:", this.searchKeyword, "type:", this.searchType);
      this.Search();
    } else {
      this.firstSearchAttempted = false; // 如果初始没有关键词
    }
  },
  watch: {
    '$route.query': {
      deep: true, // ✨ 监听 query 对象的深度变化
  /*    immediate: true, // 关键：组件创建时立即执行一次 handler*/
      handler(newQuery, oldQuery) {
        console.log("routerchanged",newQuery)
        const newKeyword = newQuery.key || '';
        const newType = newQuery.type || 'video'; // 默认类型

        // 仅当关键词或类型实际改变时才执行搜索，或者首次加载时
        // (immediate: true 会在首次加载时 newKeyword 和 this.searchKeyword 可能不同)
        if (newKeyword !== this.searchKeyword || newType !== this.searchType || !this.firstSearchAttempted) {
          this.searchKeyword = newKeyword;
          this.searchType = newType;
          if (this.searchKeyword.trim()) {
            this.Search();
          } else {
            // 如果关键词变为空，清空结果
            this.results = { users: [], videos: [] };
            this.firstSearchAttempted = false; // 可能需要重置
          }
        }
      }

    }
  },
  computed: {
    hasResults() {
      return (this.results.users && this.results.users.length > 0) ||
          (this.results.videos && this.results.videos.length > 0);
    }
  },
}
</script>

<template>

  <div class="search-page">
    <el-dialog :visible.sync="dialogFormVisible" ref="dialog" width="70%"
               top="5vh"
               :before-close="closeVideoDialog"
               class="dialog">
      <!-- 设置标题 -->
      <span slot="title" class="dialog-title">{{
          /* currentVideo ? currentVideo.title : */
          '视频播放'
        }}</span>
      <PlayerView v-if="dialogFormVisible" ref="player"  style="width: 100%; height: 800px;"
                  :load-initial-videos-function="fetchInitialVideosForPlayerView"
                  :load-more-videos-function="fetchMoreVideosForPlayerView"></PlayerView>
    </el-dialog>
    <el-container>
      <el-header class="search-header">
        <el-button icon="el-icon-arrow-left" @click="back" class="back-button">返回</el-button>
        <div class="search-types">
          <el-button-group>
<!--            <el-button :type="type === 'general' ? 'primary' : 'default'" @click="changeType('general')">综合</el-button>-->
            <el-button :type="searchType === 'video' ? 'primary' : 'default'" @click="changeType('video')">视频</el-button>
            <el-button :type="searchType === 'user' ? 'primary' : 'default'" @click="changeType('user')">用户</el-button>
          </el-button-group>
        </div>

      </el-header>
      <el-main class="search-results-container" v-loading="loading" element-loading-background="rgba(0, 0, 0, 0)" >
        <div v-if="!loading && !hasResults" class="no-results">
          <el-empty :description="firstSearchAttempted ? '未找到相关内容' : '请输入关键词开始搜索'"></el-empty>
        </div>

        <div v-if="hasResults">
          <!-- 视频搜索结果 -->
          <div v-if="searchType === 'video' && results.videos && results.videos.length > 0" class="result-section">
            <h3>视频</h3>
            <ul class="video-list">
              <li v-for="video in results.videos" :key="video.videoId" class="video-item">
                <div class="video-info" @click="showVideoDialog(video.videoId)" >
                  <!-- 视频封面 -->
                  <img v-if="video.coverUrl" :src="video.coverUrl" :alt="video.title || '视频封面'" class="video-cover" />
                  <div v-else class="video-cover-placeholder" aria-label="视频封面占位符"></div>
                  <!-- 视频文字信息 -->
                  <div class="video-text-content">
                    <span class="video-title" :title="video.title">{{ video.title }}</span>
                    <span class="video-desc" :title="video.description">{{ video.description }}</span>
                    <span class="video-author">UP主: {{ video.userName || '未知作者' }}</span>
                  </div>
                </div>
              </li>

            </ul>
          </div>

          <!-- 用户搜索结果 -->
          <div v-if="searchType === 'user' && results.users && results.users.length > 0" class="result-section">
            <h3>用户</h3>
            <ul class="user-list">
              <li v-for="(user,index) in results.users"  class="user-item" >
                <el-avatar :size="40" :src="user.avatar || defaultAvatar" @click.native="handleToUserButton(user.userId)" :alt="`${user.userName}的头像`"></el-avatar>
                <div class="user-info" @click="handleToUserButton(user.userId)">
                  <span class="user-name">{{ user.userName }}</span>
                  <span class="user-name">id：{{ user.userId }}</span>
                  <span class="user-desc">{{ user.userInfo }}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </el-main>
    </el-container>

  </div>

</template>

<style>
/* --- CSS 自定义属性 (变量) --- */
:root {
  --search-bg-primary: #000000; /* 主背景色 */
  --search-bg-secondary: #101010; /* 卡片、悬浮等较亮背景 */
  --search-bg-header: #181818; /* 头部背景 */
  --search-bg-button-default: #282828; /* 默认按钮背景 */
  --search-bg-button-default-hover: #383838; /* 默认按钮悬浮背景 */
  --search-bg-button-primary: #007AFF; /* 主题色按钮背景 (Element UI 蓝) */
  --search-bg-button-primary-hover: #3395ff; /* 主题色按钮悬浮背景 */
  --search-bg-loading-mask: rgba(0, 0, 0, 0.75); /* 加载遮罩 */
  --search-bg-placeholder: #222222; /* 占位符背景 */
  --search-bg-dialog: #1c1c1c; /* 对话框背景 */

  --search-border-primary: #2c2c2c; /* 主要边框、分割线 */
  --search-border-button-default: #3a3a3a; /* 默认按钮边框 */
  --search-border-dialog: #333333; /* 对话框边框 */

  --search-text-primary: #e0e0e0; /* 主要文字颜色 */
  --search-text-secondary: #a0a0a0; /* 次要文字、默认按钮文字 */
  --search-text-tertiary: #888888; /* 更暗的文字，如作者名、ID */
  --search-text-placeholder: #757575; /* 空状态提示文字 */
  --search-text-title: #f0f0f0; /* 区块标题文字 */
  --search-text-on-primary: #ffffff; /* 主题色按钮上的文字 */
  --search-text-icon: #a0a0a0; /* 图标颜色 */
  --search-text-icon-hover: #ffffff; /* 图标悬浮颜色 */

  --search-scrollbar-thumb: #282828;
  --search-scrollbar-thumb-hover: #333333;

  --search-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --search-font-weight-normal: 400;
  --search-font-weight-medium: 500;
  --search-font-weight-semibold: 600;

  --search-spacing-unit: 8px;
  --search-border-radius: 4px;
  --search-border-radius-card: calc(var(--search-border-radius) * 2); /* 卡片圆角 8px */

  --search-shadow-card: 0 2px 5px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.15); /* 卡片阴影 */
  --search-shadow-card-hover: 0 5px 10px rgba(0,0,0,0.25), 0 3px 6px rgba(0,0,0,0.2); /* 卡片悬浮阴影 */

  --search-video-cover-width: 130px; /* 视频封面宽度 */
  --search-video-cover-height: 80px; /* 视频封面高度 */
}

/* --- 整体页面布局 --- */
.search-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--search-bg-primary);
  color: var(--search-text-primary);
  font-family: var(--search-font-family);
}

/* --- 头部区域 --- */
.search-header {
  display: flex;
  align-items: center;
  padding: calc(var(--search-spacing-unit) * 1.5) calc(var(--search-spacing-unit) * 2.5); /* 12px 20px */
  background-color: var(--search-bg-header);
  border-bottom: 1px solid var(--search-border-primary);
  height: auto !important;
  line-height: normal !important;
  gap: calc(var(--search-spacing-unit) * 2); /* 按钮和类型组之间的间距 */
}

.search-header .back-button {
  background-color: transparent;
  border-color: transparent;
  color: var(--search-text-icon);
  padding: var(--search-spacing-unit) calc(var(--search-spacing-unit) * 1.5);
  font-weight: var(--search-font-weight-medium);
  transition: background-color 0.2s ease, color 0.2s ease;
  border-radius: var(--search-border-radius);
}
.search-header .back-button:hover,
.search-header .back-button:focus {
  background-color: var(--search-bg-button-default-hover);
  color: var(--search-text-icon-hover);
  outline: none;
}
.search-header .back-button i {
  color: inherit;
  font-size: 1.1em; /* 稍微放大返回图标 */
}

/* --- 搜索类型按钮组 --- */
.search-types .el-button-group .el-button {
  background-color: var(--search-bg-button-default);
  border-color: var(--search-border-button-default);
  color: var(--search-text-secondary);
  font-weight: var(--search-font-weight-medium);
  padding: calc(var(--search-spacing-unit) * 1.125) calc(var(--search-spacing-unit) * 2); /* 9px 16px */
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}
.search-types .el-button-group .el-button:hover,
.search-types .el-button-group .el-button:focus {
  background-color: var(--search-bg-button-default-hover);
  border-color: var(--search-border-button-default);
  color: var(--search-text-primary);
  outline: none;
}
.search-types .el-button-group .el-button.el-button--primary {
  background-color: var(--search-bg-button-primary);
  border-color: var(--search-bg-button-primary);
  color: var(--search-text-on-primary);
  z-index: 1;
}
.search-types .el-button-group .el-button.el-button--primary:hover,
.search-types .el-button-group .el-button.el-button--primary:focus {
  background-color: var(--search-bg-button-primary-hover);
  border-color: var(--search-bg-button-primary-hover);
}
.search-types .el-button-group .el-button:first-child {
  border-top-left-radius: var(--search-border-radius);
  border-bottom-left-radius: var(--search-border-radius);
}
.search-types .el-button-group .el-button:last-child {
  border-top-right-radius: var(--search-border-radius);
  border-bottom-right-radius: var(--search-border-radius);
}
.search-types .el-button-group .el-button:not(:first-child) {
  margin-left: -1px;
}

/* --- 主要内容区域 --- */
.search-results-container {
  flex-grow: 1;
  overflow-y: auto;
  padding: calc(var(--search-spacing-unit) * 2) calc(var(--search-spacing-unit) * 2.5) calc(var(--search-spacing-unit) * 2.5); /* 16px 20px 20px */
  background-color: var(--search-bg-primary);
}

/* 加载中和空状态 (Element UI 深度选择器) */
.search-results-container >>> .el-loading-mask {
  background-color: var(--search-bg-loading-mask) !important;
}
.search-results-container >>> .el-loading-spinner .el-icon-loading,
.search-results-container >>> .el-loading-spinner .el-loading-text {
  color: var(--search-text-secondary) !important;
}
.no-results {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px; /* 给空状态一些高度 */
}
.no-results >>> .el-empty__description p {
  color: var(--search-text-placeholder) !important;
  font-size: 0.95rem;
}
.no-results >>> .el-empty__image {
  width: 120px; /* 调整空状态图标大小 */
}
.no-results >>> .el-empty__image svg {
  fill: var(--search-text-placeholder) !important;
}

/* --- 结果区域通用样式 --- */
.result-section {
  margin-top: calc(var(--search-spacing-unit) * 2.5); /* 20px */
  margin-bottom: calc(var(--search-spacing-unit) * 3.75); /* 30px */
}
.result-section h3 {
  font-size: 1.05rem; /* 17px */
  color: var(--search-text-title);
  margin-bottom: calc(var(--search-spacing-unit) * 2.5); /* 20px */
  padding-bottom: calc(var(--search-spacing-unit) * 1.25); /* 10px */
  border-bottom: 1px solid var(--search-border-primary);
  font-weight: var(--search-font-weight-semibold);
  display: flex;
  align-items: center;
}
.result-section h3 i { /* 标题图标 */
  margin-right: calc(var(--search-spacing-unit) * 1); /* 8px */
  font-size: 1.1em;
  color: var(--search-text-title);
}

/* 列表通用样式 */
.user-list, .video-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: calc(var(--search-spacing-unit) * 2); /* 16px 卡片间距 */
}

/* --- 卡片式列表项 --- */
.user-item, .video-item {
  display: flex;
  align-items: flex-start;
  background-color: var(--search-bg-secondary);
  border-radius: var(--search-border-radius-card);
  padding: calc(var(--search-spacing-unit) * 2); /* 16px 卡片内边距 */
  box-shadow: var(--search-shadow-card);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden; /* 确保内容不超过卡片 */
}
.user-item:hover, .video-item:hover {
  transform: translateY(-3px);
  box-shadow: var(--search-shadow-card-hover);
}

/* --- 用户项特定样式 --- */
.user-item {
  cursor: pointer;
}
.user-item .el-avatar {
  margin-right: calc(var(--search-spacing-unit) * 2); /* 16px */
  flex-shrink: 0;
  margin-top: calc(var(--search-spacing-unit) * 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.user-item:hover .el-avatar {
  transform: scale(1.08);
  box-shadow: 0 0 0 2px var(--search-bg-button-primary);
}
.user-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex-grow: 1;
  overflow: hidden;
  gap: calc(var(--search-spacing-unit) * 0.5); /* 4px */
}
.user-name {
  font-size: 1rem; /* 16px */
  font-weight: var(--search-font-weight-semibold);
  color: var(--search-text-primary);
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.user-info .user-name:nth-child(2) { /* userId的样式 */
  font-size: 0.8125rem; /* 13px */
  font-weight: var(--search-font-weight-normal);
  color: var(--search-text-tertiary);
  margin-top: calc(var(--search-spacing-unit) * -0.25); /* 微调与用户名的间距 */
}
.user-desc {
  font-size: 0.875rem; /* 14px */
  color: var(--search-text-secondary);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}

/* --- 视频项特定样式 --- */
.video-item .video-info { /* 将 video-info 作为可点击区域 */
  display: flex;
  width: 100%;
  cursor: pointer;
}
.video-item .video-cover,
.video-item .video-cover-placeholder {
  width: var(--search-video-cover-width);
  height: var(--search-video-cover-height);
  object-fit: cover;
  border-radius: var(--search-border-radius);
  margin-right: calc(var(--search-spacing-unit) * 2); /* 16px */
  flex-shrink: 0;
  background-color: var(--search-bg-placeholder);
  transition: transform 0.3s ease;
}
.video-item .video-cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}
.video-item .video-info:hover .video-cover {
  transform: scale(1.05);
}
.video-text-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 让标题和作者/描述在垂直方向上分布开 */
  flex-grow: 1;
  overflow: hidden;
  min-height: var(--search-video-cover-height); /* 确保文本区域至少和封面一样高 */
  gap: calc(var(--search-spacing-unit) * 0.5); /* 4px */
}
.video-title {
  font-size: 1rem; /* 16px */
  font-weight: var(--search-font-weight-semibold);
  color: var(--search-text-primary);
  line-height: 1.3; /* 略微减小行高，如果标题太长可能会换行 */
  /* 对于单行标题，可以保持 nowrap */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* 如果希望标题可以两行省略 */
  /* display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: normal; */
}
.video-desc {
  font-size: 0.875rem; /* 14px */
  color: var(--search-text-secondary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1; /* 描述通常单行显示 */
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: auto; /* 将描述和作者推到底部，如果空间允许 */
}
.video-author {
  font-size: 0.8125rem; /* 13px */
  color: var(--search-text-tertiary);
  margin-top: calc(var(--search-spacing-unit) * 0.5); /* 4px */
}

/* --- 对话框 (PlayerView Dialog) --- */
.dialog >>> .el-dialog {
  background-color: var(--search-bg-dialog);
  border: 1px solid var(--search-border-dialog);
  border-radius: var(--search-border-radius-card); /* 使用卡片圆角 */
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}
.dialog >>> .el-dialog__header {
  padding: calc(var(--search-spacing-unit) * 2) calc(var(--search-spacing-unit) * 2.5) calc(var(--search-spacing-unit) * 1.5);
  border-bottom: 1px solid var(--search-border-primary);
}
.dialog >>> .el-dialog__title,
.dialog .dialog-title { /* 确保自定义的span.dialog-title也应用样式 */
  color: var(--search-text-title);
  font-size: 1.1rem;
  font-weight: var(--search-font-weight-medium);
}
.dialog >>> .el-dialog__headerbtn {
  top: calc(var(--search-spacing-unit) * 2.25);
  right: calc(var(--search-spacing-unit) * 2.5);
}
.dialog >>> .el-dialog__headerbtn .el-dialog__close {
  color: var(--search-text-secondary);
  font-size: 1.2em;
  transition: color 0.2s ease, background-color 0.2s ease;
  border-radius: 50%;
  padding: 2px;
}
.dialog >>> .el-dialog__headerbtn .el-dialog__close:hover {
  color: var(--search-text-primary);
  background-color: var(--search-bg-button-default-hover);
}
.dialog >>> .el-dialog__body {
  padding: 0; /* PlayerView 通常会占满body，外部padding设为0 */
  color: var(--search-text-primary);
  /* max-height: 85vh; /* 限制播放器最大高度，避免超出屏幕 */
  /* overflow-y: auto; */
}
/* 确保 PlayerView 的背景和 Dialog 协调，如果 PlayerView 本身没有背景 */
.dialog >>> .PlayerView {
  background-color: var(--search-bg-primary); /* 或 var(--search-bg-dialog) */
}

/* --- 滚动条美化 --- */
.search-results-container::-webkit-scrollbar,
.dialog >>> .el-dialog__body::-webkit-scrollbar { /* 也为dialog body应用 */
  width: calc(var(--search-spacing-unit) * 0.85); /* 7px */
  height: calc(var(--search-spacing-unit) * 0.85);
}
.search-results-container::-webkit-scrollbar-thumb,
.dialog >>> .el-dialog__body::-webkit-scrollbar-thumb {
  background-color: var(--search-scrollbar-thumb);
  border-radius: calc(var(--search-spacing-unit) * 0.5); /* 4px */
  transition: background-color 0.2s ease;
  border: 2px solid var(--search-bg-primary); /* 给滚动条边缘留出一些背景色，看起来更细 */
}
.search-results-container::-webkit-scrollbar-thumb:hover,
.dialog >>> .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background-color: var(--search-scrollbar-thumb-hover);
}
.search-results-container::-webkit-scrollbar-track,
.dialog >>> .el-dialog__body::-webkit-scrollbar-track {
  background: transparent; /* 或者 var(--search-bg-primary) 来匹配背景 */
}
.search-results-container,
.dialog >>> .el-dialog__body { /* Firefox */
  scrollbar-width: thin;
  scrollbar-color: var(--search-scrollbar-thumb) transparent; /* Firefox: thumb track */
}

</style>