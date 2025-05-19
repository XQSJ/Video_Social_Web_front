<script>
import toLogin from '@/utils/toLogin'
import axios from "axios";
import dayjs from "dayjs";

export default {
  props: {
    existNewMessage: Boolean
  },
  data() {
    return {
      userid: '',
      timer: '',
      messageList: {}
    }
  },
  mounted() {
    this.userid = -1
    if (localStorage.getItem('userInfo') !== null) {
      this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
    }
    this.getMessageList()

//结束轮询清除定时器
    //window.clearInterval(this.timer)
  },
  methods: {

    login() {
      toLogin.$emit('log')
    },
    checkNewMessage() {
      axios.post(`message/check/${this.userid}`)

    },
    getMessageList() {
      axios.get(`message/all/${this.userid}`).then((response) => {
        if (response.data.code === 1) {
          this.messageList = response.data.data
          if (this.existNewMessage) {
            this.checkNewMessage()
            this.$emit("checkNew")
          }
        }
      })
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
    navigateToMessageDetail(message) {

    }
  },

}
</script>

<template>
  <div class="message-list-container" style="width:100%;height:100%">
    <div v-if="userid !== -1">
      <div v-if="messageList && messageList.length > 0" class="messages-scroll-area">
        <div
            v-for="(item, index) in messageList"
            :key="item.id || index"
            class="message-item"
            @click="navigateToMessageDetail(item)"
        >
          <el-avatar
              :size="40"
              :src="item.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"
              class="message-avatar"
          ></el-avatar>
          <div class="message-content">
            <div class="message-header">
              <span class="sender-name">{{ item.senderName || '系统通知' }}</span>
              <span class="message-time">{{ formatDisplayTime(item.time) }}</span>
            </div>
            <p class="message-text">{{ item.content }}</p>
          </div>
          <!-- 如果有新消息标记，可以放在这里 -->
          <!-- <span v-if="item.isNew" class="new-message-dot"></span> -->
        </div>
      </div>
      <div v-else class="no-messages-placeholder">
        <i class="el-icon-bell"></i>
        <p>暂无新通知</p>
      </div>
      <!-- "暂时没有更多了" 的提示可以在滚动到底部时动态显示，
           或者如果列表不是无限滚动，并且已经加载了所有，可以固定显示。
           当前假设是加载了所有消息后的提示。
      -->
      <div v-if="messageList && messageList.length > 0" class="list-end-indicator">
        没有更多通知了
      </div>
    </div>

    <div v-if="userid === -1" class="login-prompt-container">
      <div class="login-prompt-icon">
        <i class="el-icon-user-solid"></i>
      </div>
      <p class="login-prompt-text">登录后即可查看通知消息</p>
      <el-button type="primary" @click="login" class="login-button">立即登录</el-button>
    </div>
  </div>
</template>
<style>
// MessageNotificationList.vue - STYLE (花括号风格)
.message-list-container {
  padding: 10px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
}

.messages-scroll-area {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 15px;

  &::-webkit-scrollbar {
    width: 5px;
  }
  &::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.message-item {
  display: flex;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #e8eaec;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #eff0f1;
  }
}

.message-avatar {
  margin-right: 12px;
  flex-shrink: 0;
}

.message-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.sender-name {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.message-time {
  font-size: 12px;
  color: #909399;
}

.message-text {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  margin: 0;
  word-break: break-word;

}

.new-message-dot {
  width: 8px;
  height: 8px;
  background-color: #F56C6C;
  border-radius: 50%;
  margin-left: 8px;
  align-self: flex-start;
}

.no-messages-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #909399;
  text-align: center;
  flex-grow: 1;

  .el-icon-bell {
    font-size: 48px;
    margin-bottom: 15px;
    color: #c0c4cc;
  }

  p {
    font-size: 14px;
  }
}

.list-end-indicator {
  text-align: center;
  padding: 15px 0;
  font-size: 13px;
  color: #b0b3b8;
}

.login-prompt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
  text-align: center;
  height: 100%;
}

.login-prompt-icon {
  .el-icon-user-solid {
    font-size: 56px;
    color: #409EFF;
    margin-bottom: 20px;
  }
}

.login-prompt-text {
  font-size: 15px;
  color: #555;
  margin-bottom: 25px;
}

.login-button {

}
</style>
}