<script >
//import OSS from '../src/resourse/aliyun-upload-sdk-1.5.6/lib/aliyun-oss-sdk-6.17.1.min'
//window.OSS = OSS;
//import '../lib/aliyun-upload-sdk/aliyun-upload-sdk-1.5.5.min'
//import "http://gosspublic.alicdn.com/aliyun-oss-sdk-4.4.4.min.js"

import axios from "axios";
import {client} from '@/utils/alioss'


/*import { Promise } from 'es6-promise';

import from 'ali-oss'*/
/*
import OSS from '../public/lib/aliyun-upload-sdk-1.5.6/lib/aliyun-oss-sdk-6.17.1.min'
window.OSS = OSS;
import '../public/lib/aliyun-upload-sdk-1.5.6/aliyun-upload-sdk-1.5.7.min'*/
import dayjs from "dayjs";

export default {
    data(){
      return{
        userid:-1,
        fileType:["mp4","jpg"],
        fileList:[],
        fileLimit:1,
        multiple: false, // 不支持多选
        formData:"",
        title:"",
        description:'',
        access:'0',
        client:'',
        uploader:null,
        tagContent:'',
        loadedPercent:0,
        uploading:false
      }
    },
    mounted() {
      console.log("creator")
      this.initInfo()
    },
    created(){
      if(localStorage.getItem('userInfo')===null){
        this.toLoginView();
      }
    },
    methods:{
      test(a){
          console.log("test:",a)
      },
      initInfo(){
        if(localStorage.getItem('userInfo')!=null){
          try {
            this.userid=JSON.parse(localStorage.getItem('userInfo')).userId;
          } catch(e) {
            console.error("initInfo: Error parsing user info from localStorage:", e);
          }
        } else {
          console.warn("initInfo: User is not logged in.");
         // this.userid=JSON.parse(localStorage.getItem('userInfo')).userId
        }

      },
      initAcsClint(){
         let _this = this;
         let uploader = new AliyunUpload.Vod({

          // userID，用于标识上传者的身份，必填，有值即可，可以是阿里云账号ID或者您自定义的用户ID，您可以访问阿里云账号中心（https://account.console.aliyun.com/）查看账号ID
          userId:1229526364672621,
          // 上传到视频点播的地域，默认值为'cn-shanghai'，
          //eu-central-1，ap-southeast-1
          region:"cn-shanghai",
          // 分片大小默认1 MB，不能小于100 KB（100*1024）
          partSize: 1048576,
          // 并行上传分片个数，默认5
          parallel: 5,
          // 网络原因失败时，重新上传次数，默认为3
          retryCount: 3,
          // 网络原因失败时，重新上传间隔时间，默认为2秒
          retryDuration: 2,
           // 添加文件成功
           addFileSuccess: function (uploadInfo) {
             console.log("addFileSuccess: " )
             console.log(uploadInfo )
           },
          // 开始上传
          'onUploadstarted':  function(uploadInfo) {
            console.log('startupvideo:')
            console.log(uploadInfo)

            if(!uploadInfo.videoId) {
              let createUrl = "/video/create"
              const formattedTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
              let createTime = formattedTime
              let description = ""
              if(_this.tagContent!==''){
                description = "#"+_this.tagContent+" "
              }
              description = description +_this.description
              let videoInfo = {
                "userId" : _this.userid,
                "title" : _this.title,
                "description" :description,
                "access" : _this.access,
                "createTime":createTime,
                "tagContent":_this.tagContent
              }

              axios.post(createUrl,videoInfo).then((response) => {
                console.log(response)
                if (response.data.code === 1) {
                  let data = response.data.data
                  console.log("axios:",data)
                  let uploadAuth = data.uploadAuth
                  let uploadAddress =data.uploadAddress
                  let videoId = data.videoId
                  uploader.setUploadAuthAndAddress(uploadInfo, uploadAuth, uploadAddress, videoId)
                  _this.uploading = true;
                }
              })
            }
            else{
              let refreshUrl = `/video/refresh/${uploadInfo.videoId}`
              axios.get(refreshUrl).then((response) => {
                if (response.data.code === 1) {
                  uploader.setUploadAuthAndAddress(uploadInfo, uploadAuth, uploadAddress, videoId)
                }
              })
            }

          },
          // 文件上传成功
          'onUploadSucceed': function (uploadInfo) {
            console.log(uploadInfo.file.name+'上传成功')


          },
          // 文件上传失败
          'onUploadFailed': function (uploadInfo, code, message) {
            console.log(uploadInfo.file.name+'上传失败')
          },
          // 文件上传进度，单位：字节
          'onUploadProgress': function (uploadInfo, totalSize, loadedPercent) {
            console.log("onUploadProgress:file:" + uploadInfo.file.name + ", fileSize:" + totalSize + ", percent:" + Math.ceil(loadedPercent * 100) + "%");
            _this.loadedPercent = Math.round(loadedPercent*100);
          },
          // 上传凭证或STS token超时
          'onUploadTokenExpired': function (uploadInfo) {
            console.log("上传凭证或STS token超时")
            let refreshUrl = `/video/refresh/${uploadInfo.videoId}`
            axios.get(refreshUrl).then((response) => {
              if (response.data.code === 1) {
                let data = response.data.data
                let uploadAuth = data.uploadAuth
                let uploadAddress = data.uploadAddress
                let videoId = data.videoId
                uploader.resumeUploadWithAuth(uploadAuth)
              }
            })
          },
          // 全部文件上传结束
          'onUploadEnd':function(uploadInfo){
            console.log("onUploadEnd: uploaded all the files")
            _this.toUserView('self')
          }
        })

          return uploader
      },


      beforeUpload(file){ //上传文件之前

        if (file.type !== "" || file.type != null || file.type !== undefined){
          //截取文件的后缀，判断文件类型
          const FileExt = file.name.replace(/.+\./, "").toLowerCase();
/*          //计算文件的大小
          const isLt5M = file.size / 1024 / 1024 < 50; //这里做文件大小限制
          //如果大于50M
          if (!isLt5M) {
            this.$showMessage('上传文件大小不能超过 50MB!');
            return false;
          }*/
          //如果文件类型不在允许上传的范围内
          if(this.fileType.includes(FileExt)){

            return true;
          }
          else {
            this.$message.error("上传文件格式不正确!");
            return false;
          }
        }
      },
      handleVideoRemove(){
      },
      handleChange(file, fileList){ //文件选择后执行的方法
        this.fileList = fileList;
       // console.log("选择后文件")

      },
      delFile(){  //点击上传文件触发的额外事件,清空fileList
        this.fileList=[];
        this.uploader.cancel;
        this.uploader=null;
      },
      uploadFile(file){

          if (this.fileList.length === 0) return
        //初始化上传类
          this.uploader=this.initAcsClint()
        //添加文件
          this.uploader.addFile(this.fileList[0].raw)
      },

      submitVideo(){
        if(this.title!==''){
          //开始上传
          this.uploader.startUpload()
        }else{
          this.$message.error('标题不能为空')
        }


      },
      reUpload(){
        this.delFile()
        //document.querySelector(".el-upload .el-upload").click();
      }
    }
  }
</script>
<template>
  <!-- 页面根容器 -->
  <div class="creator-page-container">
    <!-- 使用 el-card 包裹，提供边框和阴影 -->
    <el-card class="creator-card" shadow="never">
      <!-- 卡片头部，显示标题 -->
      <div slot="header" class="card-header">
        <i class="el-icon-upload"></i>
        <span>发布新作品</span>
        <!-- 原始模板: 发布视频<br> -->
      </div>

      <!-- 使用 el-form 组织表单内容 -->
      <el-form label-position="top" class="creator-form">

        <!-- 文件上传区域 -->
        <el-form-item label="选择视频文件" required>
          <!-- el-upload 组件 -->
          <el-upload
              ref="videoUploader"
              class="video-uploader"
              drag
              action="#"
              :limit="1"
              :multiple="false"
              :file-list="fileList"
              :on-change="handleChange"
              :on-remove="handleVideoRemove"
              :before-upload="beforeUpload"
              :http-request="uploadFile"
              :accept="fileType.map(ext => '.' + ext).join(',')"
              :disabled="uploading"
          >
            <!-- 拖拽区域内部 -->
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">将视频文件拖到此处，或<em>点击上传</em></div>
            <!-- 提示信息 -->
            <div class="el-upload__tip" slot="tip">
              <!-- 根据原始 fileType 显示提示，但提示用户应上传视频 -->
              支持 MP4 等视频格式 (原始设置: {{ fileType.join(', ') }})，大小建议不超过 1GB。
            </div>
            <!-- 原始模板: <el-upload> <el-button v-show="fileList.length===0">选取文件</el-button> </el-upload> -->
            <!-- 注意：原始模板的 button 在 el-upload 内部，新模板使用 slot="trigger" 或拖拽区 -->
          </el-upload>
          <!-- 重新选择按钮 -->
          <el-button
              v-show="fileList.length > 0"
              @click="reUpload"
              size="small"
              type="warning"
              plain
              icon="el-icon-refresh"
              class="reupload-button"
              style="margin-top: 10px;">
            重新选择
          </el-button>
          <!-- 原始模板: <br> <el-button @click="reUpload" v-show="fileList.length>0">...</el-button> -->
        </el-form-item>

        <!-- 上传进度与状态显示 (可选，需要脚本支持 uploadPercent, uploadStatus 等) -->
        <!--
        <el-form-item v-if="uploading || uploadStatus">
           <el-progress v-if="uploading" :percentage="uploadPercent" status="success"></el-progress>
           <span v-else>{{ uploadStatus }}</span>
        </el-form-item>
        -->

        <!-- 作品信息填写区域 -->
        <el-divider content-position="left"><i class="el-icon-document"></i> 作品信息</el-divider>
        <!-- 原始模板: 作品描述 -->

        <el-form-item label="作品标题" required>
          <el-input
              v-model.trim="title"
              placeholder="填写作品标题，为作品获得更多流量"
              maxlength="50"
              show-word-limit>
          </el-input>
        </el-form-item>

        <el-form-item label="作品简介">
          <el-input
              type="textarea"
              v-model="description"
              placeholder="添加作品简介 (选填)"
              rows="3"
              maxlength="300"
              show-word-limit>
          </el-input>
        </el-form-item>
        <el-form-item label="标签">
          <el-input
              v-model="tagContent"
              placeholder="添加作品标签 (选填)"
              maxlength="10"
              show-word-limit>
          </el-input>
        </el-form-item>

        <el-form-item label="观看权限">
          <el-radio-group v-model="access">
            <el-radio label="0">公开 <span class="access-tip">(所有人可见)</span></el-radio>
            <el-radio label="1">私密 <span class="access-tip">(仅自己可见)</span></el-radio>
          </el-radio-group>
          <!-- 原始模板: <el-radio>公开</el-radio> <el-radio>不公开</el-radio> -->
        </el-form-item>

        <!-- 操作按钮区域 -->
        <el-form-item class="action-buttons">
          <el-progress :percentage="loadedPercent" v-if="uploading"></el-progress>
          <el-button
              type="primary"
              icon="el-icon-upload2"
              @click="submitVideo"
              :disabled="fileList.length === 0 || title.trim() === '' || uploading">
            {{ uploading ? '正在上传...' : '发 布 作 品' }}
          </el-button>
          <!-- 原始模板: <el-footer> <el-button @click="submitVideo" :disabled="fileList.length===0">发布</el-button> </el-footer> -->
          <!-- 测试按钮 -->
          <!-- <el-button @click="test(fileList.length)">Test</el-button> -->
        </el-form-item>

      </el-form>
      <!-- 原始模板 <el-container> <el-header>...</el-header> <el-main>...</el-main> ... </el-container> 结构不够语义化，已用 el-form 优化 -->
    </el-card>
  </div>
</template>

<style scoped>
/* === Creator Page Dark Theme (Standard CSS - Optimized & Unified) === */


.creator-page-container {
  /* --- Start: Local Theme Variables (Remove if defined globally in :root) --- */
  --theme-bg-color: #121212;
  --primary-bg-color: #1e1e1e;
  --secondary-bg-color: #282828; /* For less prominent surfaces like upload dragger bg */
  --tertiary-bg-color: #333333; /* For hover states or subtle distinctions */
  --input-bg-color: #252525;    /* Specific background for inputs if different from secondary */

  --primary-text-color: #e0e0e0;
  --secondary-text-color: #a0a0a0;

  --accent-color: #FE2C55; /* TikTok Red */
  --accent-color-darker: #e02049;
  --accent-color-light-text: #ffffff;
  --accent-color-hover-bg: rgba(254, 44, 85, 0.08); /* Subtle hover for text buttons */

  --border-color: #3a3a3a;       /* Borders for cards, dividers */
  --border-color-light: #4d4d4d; /* Lighter borders, e.g., for input default state */

  --disabled-bg-color: #2c2c2c;
  --disabled-text-color: #757575;
  --disabled-border-color: #383838; /* Border for disabled elements */

  --success-color: #4CAF50;
  --warning-color: #FFC107;
  --warning-color-hover-bg: rgba(255, 193, 7, 0.1);
  --warning-color-hover-text: #e6a23c;
  --danger-color: #F44336;

  --font-family-sans-serif: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --base-font-size: 14px;
  --line-height-base: 1.6;

  --border-radius-small: 4px;
  --border-radius-base: 6px;
  --border-radius-medium: 8px;
  --border-radius-large: 12px;
  --border-radius-round: 50%;

  --input-height: 40px;
  --input-padding-horizontal: 15px;
  --button-height: 40px;
  --button-padding-horizontal: 20px;

  --shadow-color: rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 2px 5px var(--shadow-color);
  --shadow-md: 0 5px 15px var(--shadow-color);
  --shadow-lg: 0 10px 30px var(--shadow-color);

  --transition-duration: 0.2s;
  --transition-timing-function: ease-in-out;
  /* --- End: Local Theme Variables --- */

  /* Base styles for the page container */
  padding: 24px;
  background-color: var(--theme-bg-color);
  min-height: calc(100vh - 40px);
  box-sizing: border-box;
  color: var(--primary-text-color);
  font-family: var(--font-family-sans-serif);
  font-size: var(--base-font-size);
  line-height: var(--line-height-base);
}

.creator-card {
  max-width: 720px;
  margin: 24px auto;
  background-color: var(--primary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-large);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.creator-card .card-header {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
  border-bottom: 1px solid var(--border-color);
  padding: 18px 24px;
  display: flex;
  align-items: center;
}

.creator-card .card-header i {
  margin-right: 12px;
  font-size: 22px;
  color: var(--accent-color);
  line-height: 1;
}

.creator-form {
  padding: 24px;
}

.creator-form .el-form-item {
  margin-bottom: 28px;
  /* 移除这里的 color: white; 因为我们想让 label 自己控制颜色 */
}

.creator-form :deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 500;
  line-height: 1.4;
  color: var(--primary-text-color); /* ✨ 使用我们定义的深色主题文字颜色 */
  font-size: 14px;
}

/* --- Upload Area --- */
.video-uploader ::v-deep .el-upload-dragger {
  width: 100%;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: var(--secondary-bg-color);
  border: 2px dashed var(--border-color-light);
  border-radius: var(--border-radius-medium);
  transition: border-color var(--transition-duration) var(--transition-timing-function),
  background-color var(--transition-duration) var(--transition-timing-function);
}
.video-uploader ::v-deep .el-upload-dragger:hover {
  border-color: var(--accent-color);
  background-color: var(--tertiary-bg-color);
}
.video-uploader ::v-deep .el-upload-dragger .el-icon-upload {
  font-size: 56px;
  color: var(--secondary-text-color);
  margin-bottom: 18px;
}
.video-uploader ::v-deep .el-upload-dragger .el-upload__text {
  color: var(--primary-text-color);
  font-size: 15px;
}
.video-uploader ::v-deep .el-upload-dragger .el-upload__text em {
  color: var(--accent-color);
  font-style: normal;
  font-weight: 500;
}
.video-uploader ::v-deep .el-upload__tip {
  line-height: 1.5;
  color: var(--secondary-text-color);
  font-size: 13px;
  margin-top: 12px;
}

/* Upload File List Item */
.video-uploader ::v-deep .el-upload-list__item {
  background-color: var(--secondary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-base);
  margin-top: 10px;
  padding: 10px 12px;
  transition: background-color var(--transition-duration) var(--transition-timing-function);
}
.video-uploader ::v-deep .el-upload-list__item:hover {
  background-color: var(--tertiary-bg-color);
}
.video-uploader ::v-deep .el-upload-list__item-name {
  color: var(--primary-text-color);
  font-size: 14px;
  margin-right: 45px;
}
.video-uploader ::v-deep .el-upload-list__item .el-icon-close {
  color: var(--secondary-text-color);
  font-size: 16px;
  top: 50%;
  transform: translateY(-50%);
  transition: color var(--transition-duration) var(--transition-timing-function);
}
.video-uploader ::v-deep .el-upload-list__item .el-icon-close:hover {
  color: var(--danger-color);
}
.video-uploader ::v-deep .el-upload-list__item-status-label,
.video-uploader ::v-deep .el-upload-list__item .el-icon-upload-success, /* Element UI < 2.15.x */
.video-uploader ::v-deep .el-upload-list__item .el-icon-circle-check { /* Element UI >= 2.15.x */
  color: var(--success-color);
  font-size: 16px;
}
.video-uploader ::v-deep .el-upload-list__item .el-icon-warning,
.video-uploader ::v-deep .el-upload-list__item .el-icon-circle-close { /* Element UI 失败图标 */
  color: var(--danger-color);
  font-size: 16px;
}
.video-uploader ::v-deep .el-upload-list__item .el-progress {
  position: absolute;
  bottom: -1px; /* 微调，使其覆盖在边框上或紧贴 */
  left: 0;
  right: 0;
  width: 100%;
  border-radius: 0 0 var(--border-radius-base) var(--border-radius-base); /* 底部圆角与列表项一致 */
  overflow: hidden; /* 确保进度条不溢出圆角 */
}
.video-uploader ::v-deep .el-upload-list__item .el-progress .el-progress-bar__outer {
  border-radius: 0; /* 进度条轨道不需要单独圆角 */
  height: 3px !important; /* 使进度条更细，作为状态指示 */
  background-color: var(--tertiary-bg-color); /* 进度条背景色 */
}
.video-uploader ::v-deep .el-upload-list__item .el-progress .el-progress-bar__inner {
  border-radius: 0;
  background-color: var(--accent-color); /* 进度颜色 */
}
.video-uploader ::v-deep .el-upload-list__item .el-progress__text {
  display: none;
}


.reupload-button.el-button--warning.is-plain {
  color: var(--warning-color);
  background: transparent;
  border: 1.5px solid var(--warning-color);
  margin-top: 12px;
  border-radius: var(--border-radius-medium);
  font-weight: 500;
  height: 36px;
  padding: 0 var(--button-padding-horizontal);
  font-size: 14px;
  transition: background-color var(--transition-duration) var(--transition-timing-function),
  color var(--transition-duration) var(--transition-timing-function),
  border-color var(--transition-duration) var(--transition-timing-function);
}
.reupload-button.el-button--warning.is-plain:hover,
.reupload-button.el-button--warning.is-plain:focus {
  background: var(--warning-color-hover-bg);
  color: var(--warning-color-hover-text);
  border-color: var(--warning-color-hover-text);
}

/* --- Divider --- */
.creator-form .el-divider--horizontal {
  margin: 32px 0;
  background-color: var(--border-color);
}
.creator-form .el-divider ::v-deep i {
  margin-right: 10px;
  font-size: 18px;
  vertical-align: middle;
  color: var(--secondary-text-color);
}
.creator-form .el-divider ::v-deep .el-divider__text {
  font-size: 15px;
  color: var(--primary-text-color);
  font-weight: 500;
  background-color: var(--primary-bg-color);
  padding: 0 18px;
}

/* --- Inputs & Textarea --- */
.creator-form ::v-deep .el-input__inner,
.creator-form ::v-deep .el-textarea__inner {
  background-color: var(--input-bg-color, var(--secondary-bg-color));
  border: 1px solid var(--border-color-light); /* 默认边框用稍浅的颜色 */
  color: var(--primary-text-color);
  border-radius: var(--border-radius-medium);
  height: var(--input-height);
  line-height: var(--input-height);
  padding: 0 var(--input-padding-horizontal);
  font-size: 14px;
  transition: border-color var(--transition-duration) var(--transition-timing-function),
  box-shadow var(--transition-duration) var(--transition-timing-function);
}
.creator-form ::v-deep .el-input__inner:hover, /* 添加 hover 状态 */
.creator-form ::v-deep .el-textarea__inner:hover {
  border-color: var(--border-color); /* 悬停时边框变深一点 */
}
.creator-form ::v-deep .el-input__inner:focus,
.creator-form ::v-deep .el-textarea__inner:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(254, 44, 85, 0.15);
}
.creator-form ::v-deep .el-input__inner::placeholder,
.creator-form ::v-deep .el-textarea__inner::placeholder {
  color: var(--secondary-text-color);
  opacity: 0.8;
}
.creator-form ::v-deep .el-input .el-input__clear,
.creator-form ::v-deep .el-input .el-input__suffix {
  color: var(--secondary-text-color);
  transition: color var(--transition-duration) var(--transition-timing-function);
}
.creator-form ::v-deep .el-input .el-input__clear:hover {
  color: var(--primary-text-color);
}

.creator-form ::v-deep .el-textarea__inner {
  height: auto;
  min-height: calc(var(--input-height) * 2.5);
  line-height: var(--line-height-base);
  padding: 10px var(--input-padding-horizontal);
}

.creator-form ::v-deep .el-input.is-disabled .el-input__inner,
.creator-form ::v-deep .el-textarea.is-disabled .el-textarea__inner {
  background-color: var(--disabled-bg-color) !important;
  border-color: var(--disabled-border-color) !important;
  color: var(--disabled-text-color) !important;
  cursor: not-allowed;
  opacity: 1;
  -webkit-text-fill-color: var(--disabled-text-color);
  box-shadow: none !important;
}

.creator-form ::v-deep .el-input__count .el-input__count-inner {
  background-color: transparent !important;
  color: var(--secondary-text-color);
  font-size: 12px;
}

/* --- Radio Group --- */
.creator-form ::v-deep .el-radio { /* 为整个 radio 元素添加外边距 */
  margin-right: 24px; /* 增加选项之间的距离 */
}
.creator-form ::v-deep .el-radio__input .el-radio__inner {
  background: transparent;
  border: 1.5px solid var(--border-color-light);
  width: 18px;
  height: 18px;
  transition: border-color var(--transition-duration) var(--transition-timing-function),
  background-color var(--transition-duration) var(--transition-timing-function);
}
.creator-form ::v-deep .el-radio__input.is-checked .el-radio__inner {
  border-color: var(--accent-color);
  background: var(--accent-color);
}
.creator-form ::v-deep .el-radio__input.is-checked .el-radio__inner::after {
  width: 7px;
  height: 7px;
  background-color: var(--accent-color-light-text);
}
.creator-form ::v-deep .el-radio__label {
  color: var(--primary-text-color);
  font-size: 14px;
  padding-left: 8px;
  transition: color var(--transition-duration) var(--transition-timing-function);
}
.creator-form ::v-deep .el-radio:hover .el-radio__label {
  color: var(--accent-color);
}
.creator-form ::v-deep .el-radio.is-disabled .el-radio__label {
  color: var(--disabled-text-color) !important;
  opacity: 1;
}
.creator-form ::v-deep .el-radio.is-disabled .el-radio__input .el-radio__inner {
  background-color: var(--disabled-bg-color) !important;
  border-color: var(--disabled-border-color) !important;
}

.creator-form .access-tip {
  color: var(--secondary-text-color);
  font-size: 12px;
  margin-left: 6px;
  font-style: italic;
}

/* --- Action Buttons & Progress --- */
.action-buttons {
  margin-top: 36px;
  text-align: right;
}

.action-buttons .el-button--primary {
  background-color: var(--accent-color);
  border: 1px solid var(--accent-color);
  color: var(--accent-color-light-text);
  border-radius: var(--border-radius-medium);
  padding: 0 var(--button-padding-horizontal);
  height: var(--button-height);
  line-height: var(--button-height);
  font-size: 15px;
  font-weight: 500;
  transition: background-color var(--transition-duration) var(--transition-timing-function),
  border-color var(--transition-duration) var(--transition-timing-function),
  box-shadow var(--transition-duration) var(--transition-timing-function);
  letter-spacing: 0.5px;
}
.action-buttons .el-button--primary:hover,
.action-buttons .el-button--primary:focus {
  background-color: var(--accent-color-darker);
  border-color: var(--accent-color-darker);
  box-shadow: 0 0 10px rgba(254, 44, 85, 0.3);
}
.action-buttons .el-button--primary.is-disabled {
  background-color: var(--disabled-bg-color);
  border-color: var(--disabled-border-color);
  color: var(--disabled-text-color);
  opacity: 1;
  box-shadow: none;
  cursor: not-allowed;
}
.action-buttons .el-button--primary.is-loading ::v-deep .el-icon-loading {
  color: var(--accent-color-light-text);
}

.action-buttons .el-progress {
  margin-bottom: 18px;
}
.action-buttons .el-progress ::v-deep .el-progress-bar__outer {
  border-radius: var(--border-radius-round, 100px);
  background-color: var(--secondary-bg-color);
  height: 10px !important;
}
.action-buttons .el-progress ::v-deep .el-progress-bar__inner {
  border-radius: var(--border-radius-round, 100px);
  background-color: var(--accent-color);
  transition: width 0.3s var(--transition-timing-function);
  text-align: right;
}
.action-buttons .el-progress.is-text-inside ::v-deep .el-progress-bar__innerText {
  color: var(--accent-color-light-text);
  font-size: 12px; /* 确保与外部文字大小一致或协调 */
  line-height: 10px; /* 与进度条高度一致 */
  padding: 0 5px; /* 调整内边距 */
  display: flex; /* 使用flex确保垂直居中 */
  align-items: center;
  justify-content: center; /* 水平居中 (如果需要) */
}
.action-buttons .el-progress ::v-deep .el-progress__text { /* 外部文字 */
  color: var(--secondary-text-color);
  font-size: 13px !important;
  margin-left: 8px;
  line-height: 1;
}

</style>
