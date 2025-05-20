<script>
import axios from "axios";
import dayjs from "dayjs";
import handleMainMenu from "@/utils/handleMainMenu";
import toLogin from "@/utils/toLogin";

export default {
  name:'CommentDialog',
  computed: {
    toLogin() {
      return toLogin
    }
  },
  data(){
    return{
      videoIndex:null,
      cardFormVisible: false,
      commentList: {},
      videoId:null,
      totalCount:0,
      sendText:"",
      count:100,
      loading:true,
      noMoreData:false,
      userId:-1,
      isReplying:false,
      replyComment:null,
      replyIndex:null
    }
  },
  mounted() {

  },
  methods:{
    changeCardShow(videoId,Commentcount,index){
      this.totalCount = Commentcount
      this.videoIndex = index
      if(this.cardFormVisible){
        this.closeCard()
      }else{
        this.showCard(videoId,Commentcount)
      }
    },
    InitData(data,count){
      if (localStorage.getItem('userInfo') !== null) {
        this.userId = JSON.parse(localStorage.getItem('userInfo')).userId;
      }
      this.videoId = data
      this.sendText=""
      this.loading=true
      this.loadInitComments();
    },
    showCard(data,count){
      if(this.loading===true){
        this.InitData(data,count)
      }
      //this.commentList.append(this.getComments(this.videoId))
      this.cardFormVisible = true
    },
    closeCard(){
      this.cardFormVisible = false
    },
    getRootComments(){
      let data ={
        'videoId':this.videoId,
        'pageSize': 3,
        'pageNum': 1
      }
      return axios.post("/comment/getByVideoId",data).then((response)=>{
        if (response.data.code === 1) {
          //this.totalCount
         /* console.log("getCommentList:",response.data.data)*/
          this.totalCount = response.data.data.totalCount
          this.$parent.setCommentCount(this.videoIndex,this.totalCount)
          return response.data.data.commentList
        } else {
          return ''
        }
      })
    },
    showChildComments(index){
      let rootComment = this.commentList[index]
      rootComment.childLoading = true
      this.$set(this.commentList,index,rootComment)
       this.getChildComments(index)
    },
    closeChildComments(index){
      let rootComment = this.commentList[index]
      rootComment.childShow = false
      this.$set(this.commentList,index,rootComment)

    },
    getChildComments(index){
      let rootComment = this.commentList[index]
      let data ={
        'rootCommentId':rootComment.commentId,
        'pageSize': 3,
        'pageNum': 1
      }
      axios.post("/comment/getChildComments",data).then((response)=>{
        if (response.data.code === 1) {
          rootComment.childComment = response.data.data
          rootComment.childShow = true
          rootComment.childLoading = false
          this.$set(this.commentList,index,rootComment)


        }
      })
    },
    async loadInitComments() {
      this.replyComment = null
      this.isReplying = false
      this.commentList = await this.getRootComments()

      this.loading = false
    },
    loadNewComments(){

    },
    send(){
      let createTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
      let data =  {
      "videoId":this.videoId,
      "userId":this.userId,
      "content":this.sendText,
      "createTime":createTime
      }
      let isRootComment = true
      if(this.isReplying){
        isRootComment = false
        let reply = this.replyComment
        if(reply.rootCommentId!==null){
          data.rootCommentId = reply.rootCommentId
        }else{
          data.rootCommentId = reply.commentId;
        }
        data.toCommentId = reply.commentId
        data.getterId = reply.userId
        data.getterName = reply.userName
      }
      axios.post("/comment/send",data).then((response)=>{
            if (response.data.code === 1) {
              this.sendText = ""
              this.totalCount = this.totalCount + 1
              this.$parent.setCommentCount(this.videoIndex, this.totalCount)
              if(isRootComment){
                this.commentList.unshift(response.data.data)
              }else{
                let rootComment = this.commentList[this.replyIndex]
                rootComment.childCommentCount+=1
                if(rootComment.childComment===undefined){
                  rootComment.childComment={
                    'commentList':[],
                    'rootCommentId':rootComment.commentId
                  }
                }
                rootComment.childComment.commentList.push(response.data.data)
                this.$set(this.commentList,this.replyIndex,rootComment)

              }
              this.closeReply()
            }
      })
    },
    handleReplyCommentButton(comment,index){
      this.isReplying=!this.isReplying
      if(this.isReplying===true){
        this.replyComment = comment
        this.replyIndex = index
      }else{
        this.replyComment = null;
        this.replyIndex = null;

      }
    },
    closeReply(){
      this.isReplying = false;
      this.replyComment = null;
      this.replyIndex = null;
    },
    formatDisplayTime(dateTime) {
      // 简单的友好时间显示，可以根据需要使用 dayjs().fromNow()
      const commentDate = dayjs(dateTime);
      const now = dayjs();
      if (now.diff(commentDate, 'day') < 1 && now.date() === commentDate.date()) {
        return commentDate.format('HH:mm'); // 当天显示时分
      } else if (now.diff(commentDate, 'day') < 2 && now.subtract(1, 'day').date() === commentDate.date()) {
        return '昨天 ' + commentDate.format('HH:mm'); // 昨天
      } else if (now.year() === commentDate.year()){
        return commentDate.format('MM-DD HH:mm'); // 今年内，显示月日时分
      }
      return commentDate.format('YYYY-MM-DD'); // 更早的
    },
    toUser(userid) {
      this.toUserView(userid)
    },
    handleOpenLog(){
      handleMainMenu.$emit('handleOpenLogView')
    },
    test(a){
      console.log("test:",a)

    },
    fresh(){
      this.loadInitComments();
    }
  }
}
</script>
<template>
  <div ref="card" class="comment-dialog-root-internal" v-show="cardFormVisible">
    <el-container v-if="cardFormVisible" class="el-container-outer">
      <el-header class="comment-dialog-header">
        <span class="header-title">评论</span>
        <div>
          <el-button @click="fresh" type="text" icon="el-icon-refresh" class="header-button" title="刷新"></el-button>
          <el-button @click="closeCard" type="text" icon="el-icon-close" class="header-button close-dialog-button" title="关闭"></el-button>
        </div>
      </el-header>

      <el-main class="comment-outer-main">
        <el-container class="el-container-inner">
          <el-header class="comment-count-header">
            全部评论：{{ totalCount }} 条
          </el-header>
          <el-main class="comment-list-main">
            <div v-if="loading && (!commentList || commentList.length === 0)" class="loading-placeholder">
              <i class="el-icon-loading"></i> 加载中...
            </div>
            <div v-else-if="!loading && (!commentList || commentList.length === 0)" class="no-comments-placeholder">
              <i class="el-icon-chat-line-square"></i> 还没有评论，快来抢沙发吧！
            </div>
            <div v-else v-infinite-scroll="loadNewComments" class="scrollable-comment-list" infinite-scroll-immediate="false" :infinite-scroll-disabled="loading || noMoreData" infinite-scroll-delay="500" infinite-scroll-distance="10">
              <!-- 根评论项 -->
              <div v-for="(item_root, index_root) in commentList" :key="item_root.commentId" class="comment-item">
                <el-avatar @click.native="toUser(item_root.userId)" :size="40" :src="item_root.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="comment-avatar" :title="item_root.userName"></el-avatar>
                <div class="comment-content-area">
                  <div class="comment-user-info">
                    <span class="user-name" @click="toUser(item_root.userId)" :title="item_root.userName">{{ item_root.userName }}</span>
                  </div>
                  <p class="comment-text">{{ item_root.content }}</p>
                  <div class="comment-meta">
                    <span class="comment-time">{{ formatDisplayTime(item_root.createTime) }}</span>
                    <div class="comment-actions">
                      <el-button type="text" icon="el-icon-chat-dot-round" @click="handleReplyCommentButton(item_root,index_root)">
                        {{ isReplying && replyComment && replyComment.commentId === item_root.commentId ? '取消回复' : '回复' }}
                      </el-button>
                      <el-button type="text" icon="el-icon-thumb">赞 {{ item_root.likeCount > 0 ? item_root.likeCount : '' }}</el-button>
                    </div>
                  </div>

                  <!-- 子评论区域 -->
                  <div v-if="item_root.childCommentCount > 0" class="child-comment-section">
                    <el-button
                        v-if="!item_root.childShow"
                        type="text"
                        size="mini"
                        class="toggle-child-comments-btn"
                        @click="showChildComments(index_root)"
                        :loading="item_root.childLoading">
                      展开 {{ item_root.childCommentCount }} 条回复 <i class="el-icon-arrow-down"></i>
                    </el-button>

                    <div v-if="item_root.childShow && item_root.childComment" class="child-comments-list">
                      <div v-for="(item_child) in item_root.childComment.commentList" :key="item_child.commentId" class="comment-item child-comment-item">
                        <el-avatar @click.native="toUser(item_child.userId)" :size="32" :src="item_child.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" class="comment-avatar" :title="item_child.userName"></el-avatar>
                        <div class="comment-content-area">
                          <div class="comment-user-info">
                            <span class="user-name" @click="toUser(item_child.userId)" :title="item_child.userName">{{ item_child.userName }}</span>
                            <span v-if="item_child.getterName" class="reply-to-user">
                              <i class="el-icon-caret-right"></i>
                              <span class="clickable-getter-name" @click="toUser(item_child.getterId)" :title="item_child.getterName">{{ item_child.getterName }}</span>
                            </span>
                          </div>
                          <p class="comment-text">{{ item_child.content }}</p>
                          <div class="comment-meta">
                            <span class="comment-time">{{ formatDisplayTime(item_child.createTime) }}</span>
                            <div class="comment-actions">
                              <el-button type="text" icon="el-icon-chat-dot-round" @click="handleReplyCommentButton(item_child,index_root)">
                                {{ isReplying && replyComment && replyComment.commentId === item_child.commentId ? '取消回复' : '回复' }}
                              </el-button>
                              <el-button type="text" icon="el-icon-thumb">赞 {{ item_child.likeCount > 0 ? item_child.likeCount : '' }}</el-button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <!-- 加载更多子评论 -->
                      <div v-if="item_root.childShow && item_root.childComment && !item_root.childComment.noMore && item_root.childComment.commentList.length < item_root.childComment.total" class="load-more-child-wrapper">
                        <el-button
                            type="text"
                            size="mini"
                            @click="loadMoreChildComments(index_root)"
                            :loading="item_root.childLoading">
                          加载更多回复
                        </el-button>
                      </div>
                      <p v-if="item_root.childShow && item_root.childComment && item_root.childComment.noMore && item_root.childComment.commentList.length > 0 && item_root.childComment.commentList.length >= item_root.childComment.total" class="list-bottom-msg small-msg">没有更多回复了</p>
                      <p v-if="item_root.childLoading && item_root.childComment && item_root.childComment.commentList.length === 0" class="list-bottom-msg small-msg">正在加载回复...</p>
                    </div>
                    <el-button
                        v-if="item_root.childShow"
                        type="text"
                        size="mini"
                        class="toggle-child-comments-btn"
                        @click="closeChildComments(index_root)">
                      收起回复 <i class="el-icon-arrow-up"></i>
                    </el-button>
                  </div>
                </div>
              </div>
              <p v-if="loading && commentList && commentList.length > 0" class="list-bottom-msg">努力加载中...</p>
              <p v-if="noMoreData && commentList && commentList.length > 0 && !loading" class="list-bottom-msg">已经到底部啦</p>
            </div>
          </el-main>
        </el-container>
      </el-main>

      <el-footer class="comment-footer-internal">
        <div v-if="isReplying && replyComment" class="reply-info-banner">
          <span class="reply-prompt">正在回复 <span class="reply-target-user" @click="toUser(replyComment.userId)" :title="replyComment.userName">@{{ replyComment.userName }}</span>:</span>
          <span class="reply-content-preview">{{ replyComment.content }}</span>
          <el-button @click="closeReply" type="text" icon="el-icon-close" class="close-reply-btn" title="取消回复"></el-button>
        </div>
        <div v-if="userId !== -1" class="comment-input-area">
          <el-input
              ref="commentInput"
              v-model="sendText"
              :placeholder="isReplying && replyComment ? `回复 @${replyComment.userName}` : '留下你的精彩评论吧...'"
              maxlength="300"
              show-word-limit
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              @keydown.enter.native.prevent="send"
              class="comment-textarea">
          </el-input>
          <el-button @click="send" type="primary" class="send-button" :disabled="!sendText.trim()">
            发送
          </el-button>
        </div>
        <div v-else class="login-prompt">
          <el-button type="text" @click="handleOpenLog">请先登录后发表评论</el-button> <!-- toUser(-1) or specific login trigger -->
        </div>
      </el-footer>
    </el-container>
  </div>
</template>
<style scoped>
/* CommentDialog.vue / VideoSideCard.vue - STYLE */
.comment-dialog-root-internal {
  height: 100%;
  width: 100%;
  display: flex;
  background-color: rgba(28, 30, 33, 0.97); /* 稍微调整背景色透明度 */
  backdrop-filter: blur(10px); /* 增加模糊度 */
  -webkit-backdrop-filter: blur(10px);
  box-shadow: -5px 0 20px rgba(0,0,0,0.5); /* 调整阴影 */
  overflow: hidden;
  color: #dcdfe6;
}

.el-container-outer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: transparent;
}

.comment-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 15px;
  height: 50px !important;
  line-height: 50px;
  font-size: 17px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255,255,255,0.08); /* 边框线更细微 */
  flex-shrink: 0;
}
.header-title {
  color: #e0e4eb; /* 标题颜色更亮些 */
}
.header-button {
  padding: 0;
  font-size: 18px;
  color: #aeb1b7;
  margin-left: 15px;
}
.header-button:hover {
  color: #FE2C55;
}
.close-dialog-button {
  font-size: 22px;
}


.comment-outer-main {
  padding: 0;
  flex-grow: 1;
  overflow: hidden;
}

.el-container-inner {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.comment-count-header {
  height: 40px !important;
  line-height: 40px;
  padding: 0 15px;
  font-size: 14px;
  color: #aab0ba; /* 调整颜色 */
  flex-shrink: 0;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.comment-list-main {
  padding: 0;
  overflow: hidden;
  flex-grow: 1;
  display: flex; /* 用于占位符居中 */
  flex-direction: column; /* 占位符或列表垂直排列 */
}

.scrollable-comment-list {
  height: 100%; /* 当有评论时，列表填满区域 */
  overflow-y: auto;
  padding: 10px 15px;
}
.scrollable-comment-list::-webkit-scrollbar {
  width: 6px;
}
.scrollable-comment-list::-webkit-scrollbar-thumb {
  background: rgba(255,255,255,0.25); /* 滚动条更明显一点 */
  border-radius: 3px;
}
.scrollable-comment-list::-webkit-scrollbar-track {
  background: transparent;
}

.comment-item {
  display: flex;
  padding: 15px 0; /* 增加垂直padding */
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-avatar {
  margin-right: 12px;
  flex-shrink: 0;
  cursor: pointer; /* 可点击手势 */
}
.comment-avatar:hover {
  opacity: 0.85;
}

.comment-content-area {
  flex-grow: 1;
  font-size: 14px;
  line-height: 1.65; /* 增加行高 */
}
.comment-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 5px; /* 微调间距 */
}
.user-name {
  font-weight: 600;
  color: #c8cdd6;
  margin-right: 8px;
  cursor: pointer; /* 可点击手势 */
}
.user-name:hover, .clickable-getter-name:hover, .reply-target-user:hover {
  color: #FE2C55;
  text-decoration: underline;
}
.clickable-getter-name, .reply-target-user {
  cursor: pointer;
  font-weight: normal; /* 回复目标通常不需要加粗 */
  color: #b0b7c1;
}


.reply-to-user {
  font-size: 13px;
  color: #8c929a;
  display: inline-flex; /* 让图标和文字在同一行对齐 */
  align-items: center;
}
.reply-to-user .el-icon-caret-right {
  margin-right: 3px;
  font-size: 14px; /* 图标稍大 */
}


.comment-text {
  margin: 0 0 10px 0; /* 增加底部margin */
  color: #dcdfe6;
  white-space: pre-wrap;
  word-break: break-word;
}
.comment-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #828891;
}
.comment-time {
  color: #828891;
}
.comment-actions .el-button {
  font-size: 12px;
  padding: 0 5px;
  color: #8c929a; /* 调整按钮颜色 */
}
.comment-actions .el-button:hover {
  color: #FE2C55;
}
.comment-actions .el-button .el-icon-thumb,
.comment-actions .el-button .el-icon-chat-dot-round {
  margin-right: 4px; /* 图标和文字间距 */
}


.child-comment-section {
  margin-top: 12px;
  background-color: rgba(255,255,255,0.025); /* 子评论区背景更细微 */
  border-radius: 5px;
  padding: 10px;
}
.toggle-child-comments-btn {
  font-size: 12px;
  color: #a5abb3;
  padding: 3px 0 !important;
}
.toggle-child-comments-btn:hover {
  color: #FE2C55;
}
.toggle-child-comments-btn i {
  margin-left: 4px;
  transition: transform 0.2s ease;
}
.toggle-child-comments-btn[aria-expanded="true"] i { /* 假设展开时有此属性 */
  transform: rotate(180deg);
}

.child-comments-list {
  margin-top: 8px;
}
.child-comment-item {
  padding: 10px 0;
}
.child-comment-item .comment-avatar {
  margin-right: 10px;
}
.load-more-child-wrapper {
  text-align: left;
  margin-top: 8px;
}
.load-more-child-wrapper .el-button {
  font-size: 12px;
  color: #a5abb3;
  padding: 3px 0 !important;
}
.load-more-child-wrapper .el-button:hover {
  color: #FE2C55;
}


.loading-placeholder,
.no-comments-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #7c828b;
  font-size: 14px;
  flex-grow: 1; /* 填满 comment-list-main 的剩余空间 */
  min-height: 150px; /* 保证一个最小高度 */
}
.loading-placeholder .el-icon-loading,
.no-comments-placeholder .el-icon-chat-line-square {
  font-size: 36px; /* 图标稍大 */
  margin-bottom: 12px;
  color: #6c7178;
}
.list-bottom-msg {
  text-align: center;
  color: #6c7178;
  padding: 15px 0;
  font-size: 13px;
}
.list-bottom-msg.small-msg { /* 用于子评论区内的提示 */
  font-size: 12px;
  padding: 8px 0;
  text-align: left; /* 子评论区提示可靠左 */
}

.comment-footer-internal {
  padding: 12px 15px; /* 增加padding */
  border-top: 1px solid rgba(255,255,255,0.08);
  flex-shrink: 0;
  height: auto !important;
  background-color: rgba(30, 32, 35, 0.85); /* 页脚背景 */
}

.reply-info-banner {
  display: flex;
  align-items: center;
  font-size: 12px;
  padding: 8px 10px; /* 增加padding */
  background-color: rgba(255,255,255,0.06); /* 调整背景 */
  border-radius: 5px;
  margin-bottom: 10px;
  color: #b0b7c1;
}
.reply-prompt {
  margin-right: 5px;
  white-space: nowrap;
}
.reply-target-user {
  font-weight: 600; /* 回复目标用户加粗 */
  color: #c8cdd6;
  margin: 0 3px;
}
.reply-content-preview {
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #9ea3ab; /* 预览内容颜色 */
  margin-right: 8px;
}
.close-reply-btn {
  padding: 0 !important;
  font-size: 18px; /* 图标稍大 */
  color: #a5abb3;
  margin-left: auto;
}
.close-reply-btn:hover {
  color: #fff;
}

.comment-input-area {
  display: flex;
  align-items: flex-end;
}

.comment-textarea {
  flex-grow: 1;
  margin-right: 10px;
}

.comment-textarea >>> .el-textarea__inner {
  background-color: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.12);
  color: white;
  border-radius: 6px;
  padding: 8px 12px;
  line-height: 1.6; /* 调整行高 */
  transition: border-color 0.2s ease; /* 过渡效果 */
}
.comment-textarea >>> .el-textarea__inner::placeholder {
  color: #777c83;
}
.comment-textarea >>> .el-textarea__inner:focus {
  border-color: #FE2C55;
  box-shadow: 0 0 0 1px rgba(254, 44, 85, 0.3); /* focus时增加外发光 */
}
.comment-textarea >>> .el-input__count {
  background-color: transparent !important;
  color: #777c83;
  bottom: 3px; /* 微调位置 */
  right: 8px;
}


.send-button {
  background-color: #FE2C55;
  border-color: #FE2C55;
  color: white;
  border-radius: 6px;
  height: auto;
  padding: 8px 18px; /* 调整padding */
  align-self: flex-end;
  transition: background-color 0.2s, border-color 0.2s;
  font-weight: 500; /* 按钮文字稍粗 */
}
.send-button:hover:not([disabled]) {
  background-color: #e02049; /* hover颜色加深 */
  border-color: #e02049;
}
.send-button[disabled] {
  background-color: rgba(254, 44, 85, 0.4) !important; /* disabled状态更明显 */
  border-color: rgba(254, 44, 85, 0.4) !important;
  color: rgba(255,255,255,0.4) !important;
}

.login-prompt .el-button {
  color: #FE2C55;
  font-size: 14px;
}
.login-prompt .el-button:hover {
  color: #e02049;
  text-decoration: underline;
}
</style>