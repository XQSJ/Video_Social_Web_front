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
import Player from "xgplayer";

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
        uploading:false,
        player:null,
        currentVideoBlobUrl:null,
        userInfo:null
      }
    },
  computed:{
    showDescription(){
      let description = ""
      if(this.tagContent!==''){
        description = "#"+this.tagContent+" "
      }
      description = description +this.description
      return description || '作品简介'
    },
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
      initVideo(url){
        return new Player({
          el: this.$refs.video,
          url:url,
          plugins: [],
          poster: '',
          width: '100%',
          height: '100%',
          autoplay: false,
          keyShortcut: false,
          //autoplayMuted: true
          /*      controls: false,  // 禁用默认控制栏
                disableControls: true  // 禁用默认控制按钮*/
        });
      },
      test(a){
          console.log("test:",a)
      },
      initInfo(){
        if(localStorage.getItem('userInfo')!=null){
          try {
            this.userid=JSON.parse(localStorage.getItem('userInfo')).userId;
            this.userInfo = JSON.parse(localStorage.getItem('userInfo'))
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
      handleVideoRemove(file, fileList){
        this.fileList = fileList;
      },
      handleChange(file, fileList){ //文件选择后执行的方法

        this.fileList = fileList.slice(-1);


      /*  this.$refs.videoUploader.clearFiles();*/
       console.log("选择后文件")

      },
      delFile(){  //点击上传文件触发的额外事件,清空fileList
        this.fileList=[];
        this.uploader.cancel;
        this.uploader=null;
      },
      uploadFile(file){
        if (this.$refs.videoUploader) {
          this.$refs.videoUploader.clearFiles();
        }

          if (this.fileList.length === 0) return
        //初始化上传类
          this.uploader=this.initAcsClint()
        //添加文件
          this.uploader.addFile(this.fileList[0].raw)



        if (this.player) { // 确保播放器已初始化且有文件
            this.player.destroy()
        }
        const videoBlobUrl = URL.createObjectURL(this.fileList[0].raw);
        this.player = this.initVideo(videoBlobUrl)
        if (this.currentVideoBlobUrl) {
          URL.revokeObjectURL(this.currentVideoBlobUrl);
        }
        this.currentVideoBlobUrl = videoBlobUrl; // 存储当前的 Blob URL 以便后续释放
        // 【核心预览逻辑】
   /*     if (this.player &&file.file) { // 确保播放器已初始化且有文件
          const videoBlobUrl = URL.createObjectURL(file.file);
          this.player.setConfig({ // 或者直接 player.src = videoBlobUrl;
            url: videoBlobUrl,
          });
          // 可选：如果希望选择后立即播放预览
           this.player.reload();

          // 【重要】管理 Blob URL 的生命周期
          // 当不再需要这个预览（例如，用户重新选择文件，或组件销毁）时，应释放 Blob URL
          // 可以在 this.player 的 destroy 事件或 Vue 的 beforeDestroy 钩子中处理
          // 或者在下一次调用 uploadFile 之前，如果旧的 Blob URL 存在，则先 revoke
          if (this.currentVideoBlobUrl) {
            URL.revokeObjectURL(this.currentVideoBlobUrl);
          }
          this.currentVideoBlobUrl = videoBlobUrl; // 存储当前的 Blob URL 以便后续释放
        }*/
      },

      submitVideoToAliyun(){
        if(this.title!==''){
          //开始上传
          this.uploader.startUpload()
        }else{
          this.$message.error('标题不能为空')
        }


      },
      reUpload(){
/*
        if (this.$refs.videoUploader) {
          this.$refs.videoUploader.clearFiles(); // 清空 el-upload 组件的内部文件列表
        }
*/
        this.$refs.videoUploader.$el.querySelector('.el-upload-dragger').click()


      }
    },

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
              v-show="fileList.length<1"
              ref="videoUploader"
              class="video-uploader"
              :show-file-list="false"
              drag
              action="#"
              :limit="2"
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
          <div ref="video" style="height:500px"  v-show="fileList.length>0"  class="player-instance">
            <div class="video-info-overlay">
              <div class="video-description-content" v-if="fileList.length>0">
                <p class="author-name">@{{userInfo.userName || '' }}</p>
                <p class="video-title">{{ title || '作品标题将会显示在这里' }}</p>
                <p class="video-detail-desc"> {{showDescription }}</p>
              </div>
            </div></div>



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
              @click="submitVideoToAliyun"
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
/* === Creator Page Light Theme (Standard CSS - Optimized & Unified) - No :root variables === */

.creator-page-container {
  padding: 24px;
  background-color: #f4f5f7; /* 页面背景色 - 浅灰色 */
  min-height: calc(100vh - 40px);
  box-sizing: border-box;
  color: #303133; /* 主要文字颜色 - 深灰色 */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  font-size: 14px;
  line-height: 1.6;
}

.creator-card {
  max-width: 720px;
  margin: 24px auto;
  background-color: #ffffff; /* 卡片背景白色 */
  border: 1px solid #dcdfe6; /* 浅色边框 */
  border-radius: 12px; /* --border-radius-large */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* --shadow-md with light shadow color */
  overflow: hidden;
}

.creator-card .card-header {
  font-size: 18px;
  font-weight: 600;
  color: #303133; /* 主要文字颜色 */
  border-bottom: 1px solid #dcdfe6; /* 浅色边框 */
  padding: 18px 24px;
  display: flex;
  align-items: center;
}

.creator-card .card-header i {
  margin-right: 12px;
  font-size: 22px;
  color: #FE2C55; /* 主题强调色 (TikTok Red) */
  line-height: 1;
}

.creator-form {
  padding: 24px;
}

.creator-form .el-form-item {
  margin-bottom: 28px;
}

.creator-form :deep(.el-form-item__label) {
  padding-bottom: 8px;
  font-weight: 500;
  line-height: 1.4;
  color: #303133 !important; /* 主要文字颜色 */
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
  background-color: #f0f2f5; /* 次要表面背景色 - 极浅灰色 */
  border: 2px dashed #e4e7ed; /* 更浅的边框颜色 */
  border-radius: 8px; /* --border-radius-medium */
  transition: border-color 0.2s ease-in-out,
  background-color 0.2s ease-in-out;
}
.video-uploader ::v-deep .el-upload-dragger:hover {
  border-color: #FE2C55; /* 主题强调色 */
  background-color: #e9ecef; /* 悬停状态或细微区分的背景色 - 浅灰色 */
}
.video-uploader ::v-deep .el-upload-dragger .el-icon-upload {
  font-size: 56px;
  color: #606266; /* 次要文字颜色 - 中灰色 */
  margin-bottom: 18px;
}
.video-uploader ::v-deep .el-upload-dragger .el-upload__text {
  color: #303133; /* 主要文字颜色 */
  font-size: 15px;
}
.video-uploader ::v-deep .el-upload-dragger .el-upload__text em {
  color: #FE2C55; /* 主题强调色 */
  font-style: normal;
  font-weight: 500;
}
.video-uploader ::v-deep .el-upload__tip {
  line-height: 1.5;
  color: #606266; /* 次要文字颜色 */
  font-size: 13px;
  margin-top: 12px;
}

/* --- 视频预览区域样式 --- */
.video-preview-wrapper { /* This class was in your HTML but no styles were applied, adding if needed */
  position: relative;
  width: 100%;
  height: 500px;
  background-color: #000;
  border-radius: 8px; /* --border-radius-medium */
  overflow: hidden;
  margin-top: 10px;
}

.player-instance { /* This is the ref="video" div */
  width: 100%;
  height: 100%; /* Ensure it fills the parent if .video-preview-wrapper is used */
  /* If .video-preview-wrapper is NOT used, and this is directly after upload,
     you might want to add the background and border-radius here instead. */
  background-color: #000; /* Added here to ensure a black background for the player */
  border-radius: 8px; /* --border-radius-medium, matches preview wrapper if separate */
  overflow: hidden; /* To contain the player within rounded corners */
}
.player-instance ::v-deep video {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain;
}

/* 视频预览遮罩层样式 */
.video-info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 15px 20px;
  box-sizing: border-box;
  z-index: 10;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0) 100%);
  color: #FFFFFF; /* 遮罩层文字 - 纯白色 */
  pointer-events: none;
}
.video-info-overlay .author-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #FFFFFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
}
.video-info-overlay .video-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  line-height: 1.3;
  color: #FFFFFF;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.video-info-overlay .video-detail-desc {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 0;
  color: #FFFFFF;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 重新选择按钮 */
.reupload-button.el-button--warning.is-plain {
  color: #E6A23C; /* 警告色 (Element UI Warning) */
  background: #ffffff; /* 背景为白色或卡片背景色 */
  border: 1.5px solid #E6A23C;
  margin-top: 12px;
  border-radius: 8px; /* --border-radius-medium */
  font-weight: 500;
  height: 36px;
  padding: 0 20px; /* --button-padding-horizontal */
  font-size: 14px;
  transition: background-color 0.2s ease-in-out,
  color 0.2s ease-in-out,
  border-color 0.2s ease-in-out;
}
.reupload-button.el-button--warning.is-plain:hover,
.reupload-button.el-button--warning.is-plain:focus {
  background: rgba(230, 162, 60, 0.1); /* 警告色悬停背景 */
  color: #cf9236; /* 警告色悬停文字 */
  border-color: #cf9236; /* 警告色悬停边框 */
}

/* --- Divider --- */
.creator-form .el-divider--horizontal {
  margin: 32px 0;
  background-color: #dcdfe6; /* 边框颜色 */
}
.creator-form .el-divider ::v-deep i {
  margin-right: 10px;
  font-size: 18px;
  vertical-align: middle;
  color: #606266; /* 次要文字颜色 */
}
.creator-form .el-divider ::v-deep .el-divider__text {
  font-size: 15px;
  color: #303133; /* 主要文字颜色 */
  background-color: #ffffff; /* 分割线文字背景与卡片背景一致 */
  padding: 0 18px;
}

/* --- Inputs & Textarea --- */
.creator-form ::v-deep .el-input__inner,
.creator-form ::v-deep .el-textarea__inner {
  background-color: #ffffff; /* 输入框背景 - 白色 */
  border: 1px solid #e4e7ed; /* 更浅的边框颜色 */
  color: #303133; /* 主要文字颜色 */
  border-radius: 8px; /* --border-radius-medium */
  height: 40px; /* --input-height */
  line-height: 40px; /* --input-height */
  padding: 0 15px; /* --input-padding-horizontal */
  font-size: 14px;
  transition: border-color 0.2s ease-in-out,
  box-shadow 0.2s ease-in-out;
}
.creator-form ::v-deep .el-input__inner:hover,
.creator-form ::v-deep .el-textarea__inner:hover {
  border-color: #dcdfe6; /* 边框颜色 */
}
.creator-form ::v-deep .el-input__inner:focus,
.creator-form ::v-deep .el-textarea__inner:focus {
  border-color: #FE2C55; /* 主题强调色 */
  box-shadow: 0 0 0 3px rgba(254, 44, 85, 0.1);
}
.creator-form ::v-deep .el-input__inner::placeholder,
.creator-form ::v-deep .el-textarea__inner::placeholder {
  color: #909399; /* Element UI placeholder color or your --secondary-text-color with opacity */
  opacity: 1; /* Ensure placeholder color is fully visible if direct color is set */
}
.creator-form ::v-deep .el-input .el-input__clear,
.creator-form ::v-deep .el-input .el-input__suffix {
  color: #606266; /* 次要文字颜色 */
  transition: color 0.2s ease-in-out;
}
.creator-form ::v-deep .el-input .el-input__clear:hover {
  color: #303133; /* 主要文字颜色 */
}
.creator-form ::v-deep .el-textarea__inner {
  height: auto;
  min-height: calc(40px * 2.5); /* calc(var(--input-height) * 2.5) */
  line-height: 1.6; /* --line-height-base */
  padding: 10px 15px; /* padding: 10px var(--input-padding-horizontal) */
}
/* 禁用状态输入框 */
.creator-form ::v-deep .el-input.is-disabled .el-input__inner,
.creator-form ::v-deep .el-textarea.is-disabled .el-textarea__inner {
  background-color: #f5f7fa !important; /* 禁用背景色 */
  border-color: #e4e7ed !important; /* 禁用边框色 */
  color: #c0c4cc !important; /* 禁用文字色 */
  cursor: not-allowed;
  opacity: 1;
  -webkit-text-fill-color: #c0c4cc;
  box-shadow: none !important;
}
.creator-form ::v-deep .el-input__count .el-input__count-inner {
  background-color: transparent !important;
  color: #606266; /* 次要文字颜色 */
  font-size: 12px;
}

/* --- Radio Group --- */
.creator-form ::v-deep .el-radio {
  margin-right: 24px;
}
.creator-form ::v-deep .el-radio__input .el-radio__inner {
  background: #ffffff; /* Radio 内圈背景 */
  border: 1.5px solid #e4e7ed; /* Radio 边框 */
  width: 18px;
  height: 18px;
  transition: border-color 0.2s ease-in-out,
  background-color 0.2s ease-in-out;
}
.creator-form ::v-deep .el-radio__input.is-checked .el-radio__inner {
  border-color: #FE2C55; /* 主题强调色 */
  background: #FE2C55; /* 主题强调色 */
}
.creator-form ::v-deep .el-radio__input.is-checked .el-radio__inner::after {
  width: 7px;
  height: 7px;
  background-color: #ffffff; /* 选中标记 - 白色 */
}
.creator-form ::v-deep .el-radio__label {
  color: #303133; /* 主要文字颜色 */
  font-size: 14px;
  padding-left: 8px;
  transition: color 0.2s ease-in-out;
}
.creator-form ::v-deep .el-radio:hover .el-radio__label {
  color: #FE2C55; /* 主题强调色 */
}
/* 禁用状态 Radio */
.creator-form ::v-deep .el-radio.is-disabled .el-radio__label {
  color: #c0c4cc !important; /* 禁用文字色 */
  opacity: 1;
}
.creator-form ::v-deep .el-radio.is-disabled .el-radio__input .el-radio__inner {
  background-color: #f5f7fa !important; /* 禁用背景色 */
  border-color: #e4e7ed !important; /* 禁用边框色 */
}
.creator-form .access-tip {
  color: #606266; /* 次要文字颜色 */
  font-size: 12px;
  margin-left: 6px;
  font-style: italic;
}

/* --- Action Buttons & Progress --- */
.action-buttons {
  margin-top: 36px;
  text-align: right;
}
/* 主要操作按钮 (例如发布按钮) */
.action-buttons .el-button--primary {
  background-color: #FE2C55; /* 主题强调色 */
  border: 1px solid #FE2C55; /* 主题强调色 */
  color: #ffffff; /* 按钮文字 - 白色 */
  border-radius: 8px; /* --border-radius-medium */
  padding: 0 20px; /* --button-padding-horizontal */
  height: 40px; /* --button-height */
  line-height: 40px; /* --button-height */
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out,
  border-color 0.2s ease-in-out,
  box-shadow 0.2s ease-in-out;
  letter-spacing: 0.5px;
}
.action-buttons .el-button--primary:hover,
.action-buttons .el-button--primary:focus {
  background-color: #e02049; /* 主题强调色 - 深色变体 */
  border-color: #e02049; /* 主题强调色 - 深色变体 */
  box-shadow: 0 0 10px rgba(254, 44, 85, 0.2);
}
.action-buttons .el-button--primary.is-disabled {
  background-color: #f5f7fa; /* 禁用背景色 */
  border-color: #e4e7ed; /* 禁用边框色 */
  color: #c0c4cc; /* 禁用文字色 */
  opacity: 1;
  box-shadow: none;
  cursor: not-allowed;
}
.action-buttons .el-button--primary.is-loading ::v-deep .el-icon-loading {
  color: #ffffff; /* 按钮文字 - 白色 */
}

/* 进度条 */
.action-buttons .el-progress {
  margin-bottom: 18px;
}
.action-buttons .el-progress ::v-deep .el-progress-bar__outer {
  border-radius: 50px; /* --border-radius-round or 100px */
  background-color: #f0f2f5; /* 次要表面背景色 */
  height: 18px !important;
}
.action-buttons .el-progress ::v-deep .el-progress-bar__inner {
  border-radius: 50px; /* --border-radius-round or 100px */
  background-color: #FE2C55; /* 主题强调色 */
  transition: width 0.3s ease-in-out;
  text-align: right;
  line-height: 18px;
}
.action-buttons .el-progress.is-text-inside ::v-deep .el-progress-bar__innerText {
  color: #ffffff; /* 进度条内部文字 - 白色 */
  font-size: 12px;
  padding: 0 8px;
}
.action-buttons .el-progress:not(.is-text-inside) ::v-deep .el-progress__text {
  color: #606266; /* 次要文字颜色 */
  font-size: 13px !important;
  margin-left: 8px;
  line-height: 1;
}

</style>
