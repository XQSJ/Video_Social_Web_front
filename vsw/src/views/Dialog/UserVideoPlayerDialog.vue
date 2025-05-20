<script >

import PlayerView from "@/views/PlayerView.vue";
import axios from "axios";

export default {
  components: {PlayerView},
  name:'UserVideoPlayerDialog',
  data(){
    return{
      dialogFormVisible: false,
      videoId:null,
    }
  },
  methods:{
    closeDialog(){
      this.dialogFormVisible = false;
    },
    showDialog(videoId){
      console.log("showUservideo:",videoId)
      this.videoId=videoId
      this.dialogFormVisible = true;
    },
    fetchInitialVideosForPlayerView() {
      return [
        {"videoId": this.videoId}
      ]
    },
    fetchMoreVideosForPlayerView(currentListLength) {
    },

  },
  created(){
    let _this = this
    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }
  },

  mounted() {

  }
}
</script>

<template>
  <el-dialog :visible.sync="dialogFormVisible" ref="dialog" width="70%"
             top="5vh"
             :before-close="closeDialog"
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

</template>

<style scoped> /* 注意：如果您使用此CSS，lang="stylus" 应移除或改为 lang="css" */
/* 使用深度选择器 (>>> 或 /deep/) 来覆盖或增强 Element UI Dialog 组件的内部样式 */
.dialog >>> .el-dialog {
  /* ---- 对话框整体美化 ---- */
  border-radius: 10px; /* 赋予对话框圆润的边角，增添柔和感 */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1); /* 添加微妙的阴影，提升立体感与精致度 */
  /* background-color: #f8f9fa; */ /* 可选：自定义对话框背景色 (浅色系示例) */
  background-color: #000000;  /* 可选：自定义对话框背景色 (深色系示例) */
}

.dialog >>> .el-dialog .el-dialog__header {
  /* ---- 对话框头部美化 ---- */
  padding: 18px 24px; /* 微调头部内边距，使标题区域更显均衡 */
  /* border-bottom: 1px solid #dee2e6; */ /* (浅色系分割线) */
  /* border-bottom: 1px solid rgba(255, 255, 255, 0.15); */ /* (深色系分割线) */
  /* background-color: #e9ecef; */ /* 可选：自定义头部背景色 (浅色系示例) */
  background-color: #000000;   /* 可选：自定义头部背景色 (深色系示例) */
  border-top-left-radius: 10px; /* 配合整体圆角 */
  border-top-right-radius: 10px; /* 配合整体圆角 */
}

.dialog >>> .el-dialog .el-dialog__header .dialog-title {
  /* ---- 标题文字美化 ---- */ /* 直接使用您在 template 中为标题 span 定义的 class */
 /* color: #343a40; !* (浅色系标题颜色) *!*/
   color: #ecf0f1;  /* (深色系标题颜色) */
  font-size: 1.15rem; /* 调整字号，使其更易读且具现代感 */
  font-weight: 500; /* 适中的字重，清晰而不失优雅 */
}

.dialog >>> .el-dialog .el-dialog__header .el-dialog__headerbtn {
  /* ---- 关闭按钮美化 ---- */
  top: 20px; /* 调整关闭按钮位置，使其与标题对齐更美观 */
  right: 24px;
}

.dialog >>> .el-dialog .el-dialog__header .el-dialog__headerbtn .el-dialog__close {
  color: #6c757d; /* (浅色系关闭按钮颜色) */
  /* color: #bdc3c7; */ /* (深色系关闭按钮颜色) */
  font-size: 1.1rem; /* 适当调整图标大小 */
  transition: color 0.2s ease-in-out; /* 添加平滑的颜色过渡效果 */
}

.dialog >>> .el-dialog .el-dialog__header .el-dialog__headerbtn .el-dialog__close:hover {
  color: #ecf0f1; /* (浅色系悬停颜色 - Element UI 主题色) */
  /* color: #ffffff; */ /* (深色系悬停颜色) */
}

.dialog >>> .el-dialog .el-dialog__body {
  /* ---- 对话框主体内容区域 ---- */
  padding: 0; /* 由于 PlayerView 将填满，移除默认的内边距 */
  /* 如果 PlayerView 外部还有其他内容，或者希望保留一些边距，可以这样设置： */
  /* padding: 20px 24px; */
  /* background-color: #ffffff; */ /* 可选：自定义主体背景色 (浅色系示例) */
  /* background-color: #27313d; */ /* 可选：自定义主体背景色 (深色系示例) */
  border-bottom-left-radius: 10px; /* 配合整体圆角 */
  border-bottom-right-radius: 10px; /* 配合整体圆角 */
  /* 确保 PlayerView 高度正确显示，特别是当 top="5vh" 时 */
  /* max-height: calc(90vh - 60px); */ /* 假设头部约60px高 (5vh + 5vh = 10vh 上下边距) */
  /* overflow-y: auto; */ /* 如果内容可能超出 */
}

/* ---- PlayerView 容器特定样式 (如果需要) ---- */
/* 此处假设 PlayerView 组件的根元素可以通过其 style 属性或内部 class 被间接影响 */
/* 若要直接为 PlayerView 组件添加边框或特定背景，建议在 PlayerView 组件内部或通过 prop 控制 */
/* 例如，如果 PlayerView 有一个内部包裹层，如 `.player-wrapper`: */
/*
.dialog >>> .player-wrapper {
  border-radius: 0 0 10px 10px; // 仅底部的圆角，如果头部已处理
}
*/

/*
  🎨 美化说明：
  - 以上样式旨在提供一个现代化、清爽的对话框外观。
  - 使用了深度选择器 `>>>` 来确保样式能应用到 `el-dialog` 的子元素。
  - 提供了浅色系和深色系的颜色注释作为参考，您可以根据您的应用主题选择或修改。
  - `border-radius` 和 `box-shadow` 增强了视觉的柔和度与层次感。
  - 对标题和关闭按钮的细节进行了微调，以提升用户体验。
  - `el-dialog__body` 的 `padding: 0` 是因为您的 `PlayerView` 设置了 `width: 100%; height: 800px;`，
    通常意味着它会填满整个内容区域。如果实际布局不同，请调整此处的 `padding`。
*/
</style>