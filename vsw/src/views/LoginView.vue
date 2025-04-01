<script>
// Script 部分保持不变 (与你之前提供的版本一致)
import axios from "axios";
import toMainUI from '@/utils/LoginViewToMainUIView';

export default {
  data() {
    return {
      userId: '',
      userPwd: '',
      loginButton: false, // Computed property might be better
      registerButton: false, // Computed property might be better
      loading: false,
      isRegister: false,
      registerName: '',
      registerPwd: '',
      registerId: ''
    }
  },
  computed: {
    // 使用计算属性替代 watch 来控制按钮状态，更简洁
    isLoginButtonEnabled() {
      return this.userId.trim() !== '' && this.userPwd.trim() !== '';
    },
    isRegisterButtonEnabled() {
      return this.registerName.trim() !== '' && this.registerPwd.trim() !== '';
    }
  },
  methods: {
    handleRegisterButton() {
      this.registerName = ''
      this.registerPwd = ''
      this.registerId = ''
      this.isRegister = true;
    },
    goBackToLogin() {
      this.isRegister = false;
      // 清空注册字段，保留登录字段可能的用户输入
      this.registerName = '';
      this.registerPwd = '';
      this.registerId = '';
    },
    async Register() {
      if (!this.isRegisterButtonEnabled) return; // 防止重复点击或无效提交
      let userRegister = {
        "userName": this.registerName,
        "userPwd": this.registerPwd
      }
      this.loading = true;
      try {
        const response = await axios.post('/users/register', userRegister);
        if (response.data.code === 1) {
          this.registerId = response.data.data;
          this.$message.success(`注册成功！您的用户ID为：${this.registerId}，请使用ID登录。`);
          // 注册成功后自动切换回登录界面，并清空注册表单
          this.isRegister = false;
          this.registerName = '';
          this.registerPwd = '';
          // 可以选择性地将注册ID填入登录框
          // this.userId = this.registerId;
          // this.userPwd = '';
        } else {
          this.$message.error(response.data.data || '注册失败，请稍后再试');
          console.error("Registration Error:", response.data.data);
        }
      } catch (error) {
        this.$message.error('注册请求失败，请检查网络连接');
        console.error("Registration Axios Error:", error);
      } finally {
        this.loading = false; // 无论成功失败都停止 loading
      }
    },
    async verifyLogin() {
      if (!this.isLoginButtonEnabled) return; // 防止重复点击或无效提交
      let userLogin = {
        userId: this.userId,
        userPwd: this.userPwd
      }
      this.loading = true;
      try {
        const response = await axios.post('/users/login', userLogin);
        if (response.data.code === 1) {
          // 登录成功后，获取用户信息
          await this.getLoginUser(userLogin.userId); // 调用获取用户信息并存储的方法
          // getLoginUser 内部处理后续逻辑 (消息提示, emit事件)
        } else {
          let errorMsg = '登录失败';
          switch (response.data.code) {
            case 20004: errorMsg = '用户不存在'; break;
            case 20002: errorMsg = '账号或密码错误'; break;
            default: errorMsg = response.data.data || '登录失败，未知错误';
          }
          this.$message.error(errorMsg);
          console.error("Login Error:", response.data.data);
        }
      } catch (error) {
        this.$message.error('登录请求失败，请检查网络连接');
        console.error("Login Axios Error:", error);
      } finally {
        this.loading = false; // 无论成功失败都停止 loading
      }
    },
    async getUser(userId) {
      // 这是一个示例实现，你需要替换成你实际获取用户信息的 API 调用
      console.log(`模拟获取用户 ${userId} 的信息`);
      try {
        // const response = await axios.get(`/api/users/${userId}`); // 假设的 API 端点
        // if (response.data.success) {
        //   return response.data.user;
        // }
        // 模拟返回数据
        await new Promise(resolve => setTimeout(resolve, 300)); // 模拟网络延迟
        // !! 重要：这里的返回结构需要和你实际API以及后续使用的地方匹配 !!
        return {
          userId: userId,
          userName: `用户${userId}`,
          avatar: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png', // 示例头像
          fans: Math.floor(Math.random() * 1000),
          subscriber: Math.floor(Math.random() * 500),
          userInfo: '这是一个模拟用户的简介'
        };
      } catch (error) {
        console.error("Get User Info Error:", error);
        this.$message.error('获取用户信息失败');
        return null;
      }
    },
    async getLoginUser(userId) {
      const userInfo = await this.getUser(userId);
      if (userInfo) {
        localStorage.setItem("userInfo", JSON.stringify(userInfo));
        localStorage.setItem("isLogin", "1");
        // 如果你使用了 Vuex，建议通过 mutation 更新状态
        if (this.$store) {
          // 假设你有一个名为 'setUserInfo' 的 mutation
          // this.$store.commit('setUserInfo', userInfo);
          console.log("更新 Vuex 状态 (模拟)");
        }
        this.$message.success('登录成功');
        toMainUI.$emit('login'); // 通知主界面关闭登录弹窗
        // 一般不需要强制刷新整个页面，除非有特殊原因
        // this.$router.go(0)
      }
      // 如果 userInfo 获取失败，getUser 内部应该已经提示错误了
    }
  }
}
</script>

<template>
  <div class="login-register-wrapper" v-loading="loading" element-loading-text="正在处理..." element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.7)">
    <el-card class="box-card">
      <!-- Login Form -->
      <transition name="fade" mode="out-in">
        <div v-if="!isRegister" key="login">
          <div class="form-header">
            <h2 class="form-title">用户登录</h2>
          </div>
          <el-form label-position="top" @submit.native.prevent="verifyLogin">
            <el-form-item label="用户 ID">
              <el-input v-model.trim="userId" placeholder="请输入用户 ID" clearable prefix-icon="el-icon-user"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model.trim="userPwd" placeholder="请输入密码" clearable show-password prefix-icon="el-icon-lock"></el-input>
            </el-form-item>
            <el-form-item class="button-group">
              <el-button type="primary" native-type="submit" :disabled="!isLoginButtonEnabled" style="width: 100%;">登 录</el-button>
              <el-button type="text" @click="handleRegisterButton" class="switch-button">没有账户？前往注册</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- Registration Form -->
        <div v-else key="register">
          <div class="form-header">
            <el-button type="text" icon="el-icon-arrow-left" @click="goBackToLogin" class="back-button">返回登录</el-button>
            <h2 class="form-title">用户注册</h2>
          </div>
          <el-form label-position="top" @submit.native.prevent="Register">
            <el-form-item label="用户名">
              <el-input v-model.trim="registerName" placeholder="设置一个用户名" clearable prefix-icon="el-icon-user-solid"></el-input>
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model.trim="registerPwd" placeholder="设置密码" clearable show-password prefix-icon="el-icon-lock"></el-input>
            </el-form-item>
            <el-form-item class="button-group">
              <el-button type="success" native-type="submit" :disabled="!isRegisterButtonEnabled" style="width: 100%;">注 册</el-button>
            </el-form-item>
            <div v-if="registerId" class="register-success-info">
              注册成功！您的ID是: <strong>{{ registerId }}</strong>，请牢记并使用ID登录。
            </div>
          </el-form>
        </div>
      </transition>
    </el-card>
  </div>
</template>

<style scoped lang="stylus">
.login-register-wrapper
display: flex
justify-content: center
align-items: center
  // min-height: 400px // 确保在内容少时也能撑起一定高度

.box-card
width: 400px
          padding: 20px
                     border-radius: 8px
                                     box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1)

.form-header
display: flex
align-items: center
margin-bottom: 25px
                 position: relative // 为了返回按钮定位

                 .form-title
                 margin: 0 auto // 标题居中
                           font-size: 22px
                                        font-weight: 600
color: #303133

.back-button
position: absolute
left: -10px // 调整位置
         top: 50%
transform: translateY(-50%)
padding: 0 10px
             font-size: 14px

                          .el-form-item
                          margin-bottom: 20px

                                             // Element UI 的 label 默认样式可能需要调整
                                           >>> .el-form-item__label // 使用深度选择器
                                           padding-bottom: 5px
                                                            line-height: 1.5
font-weight: 500

.el-input >>> .el-input__inner // 深度选择器修改输入框内部样式
border-radius: 4px
                &:focus
                border-color: #409EFF // 聚焦时边框颜色

                .button-group
                margin-top: 30px // 按钮组与上方表单项的距离
                              .el-button
                              font-size: 16px // 稍大一点的按钮文字
                                           border-radius: 4px
                                                           .switch-button
                                                           display: block // 让文字按钮独占一行
                                                           margin: 15px auto 0 // 顶部间距，左右居中，底部无间距
font-size: 14px
             color: #409EFF
             &:hover
             color: #66b1ff

             .register-success-info
             margin-top: 15px
                           padding: 10px
                                      background-color: #f0f9eb
                                      color: #67c23a
                                      border: 1px solid #e1f3d8
                                               border-radius: 4px
                                                               text-align: center
                                                               font-size: 14px
                                                                            strong
                                                                            font-weight: bold

                                                                              // 过渡动画
                                                                            .fade-enter-active, .fade-leave-active
transition: opacity .3s ease

                      .fade-enter, .fade-leave-to
opacity: 0
</style>