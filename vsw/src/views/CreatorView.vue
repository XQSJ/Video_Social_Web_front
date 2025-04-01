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
export default {
    data(){
      return{
        userid:"1",
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
      }
    },
    mounted() {
      this.initInfo()
      this.initAcsClint()
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
              let videoInfo = {
                "userId" : _this.userid,
                "title" : _this.title,
                "description" : _this.description,
                "access" : _this.access
              }

              axios.post(createUrl,videoInfo).then((response) => {
                if (response.data.code === 1) {
                  let data = response.data.data
                  console.log(data)
                  let uploadAuth = data.uploadAuth
                  let uploadAddress =data.uploadAddress
                  let videoId = data.videoId
                  console.log(uploadAddress)
                  uploader.setUploadAuthAndAddress(uploadInfo, uploadAuth, uploadAddress, videoId)
                }
              })
            }
            else{
              let refreshUrl = `/video/refresh/${uploadInfo.videoId}`
              axios.get(refreshUrl).then((response) => {
                if (response.data.code === 1) {
                  let data = response.data.data
                  let uploadAuth = data.uploadAuth
                  let uploadAddress = data.uploadAddress
                  let videoId = data.videoId

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
         /*this.client = new AliyunUpload.Vod({
          region: "cn-shanghai",
          accessKeyId: "LTAI5tEdXUnEBu5V7sQVnkJs",
          accessKeySecret: "PRYEoatScwy8LlRROPbaRJ0DYxtdr9",

        })*/
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
      handleChange(file, fileList){ //文件选择后执行的方法

        this.fileList = fileList;
       // console.log("选择后文件")

      },
      delFile(){  //点击上传文件触发的额外事件,清空fileList
        this.fileList=[];
      },
      uploadFile(file){
          console.log("上传文件")
          //console.log(file)
          this.uploader=this.initAcsClint()
          this.uploader.addFile(this.fileList[0].raw,null,null,null,null)
      },

      submitVideo(){
        if(this.title!==''){
          this.uploader.startUpload()
        }else{
          this.$message.error('标题不能为空')
        }


      },
      reUpload(){
        this.delFile()
        document.querySelector(".el-upload .el-upload").click();
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

        <el-form-item label="观看权限">
          <el-radio-group v-model="access">
            <el-radio label="0">公开 <span class="access-tip">(所有人可见)</span></el-radio>
            <el-radio label="1">私密 <span class="access-tip">(仅自己可见)</span></el-radio>
          </el-radio-group>
          <!-- 原始模板: <el-radio>公开</el-radio> <el-radio>不公开</el-radio> -->
        </el-form-item>

        <!-- 操作按钮区域 -->
        <el-form-item class="action-buttons">
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

<style scoped lang="stylus">
// --- 页面整体与卡片 ---
.creator-page-container {
  padding: 20px; /* 页面内边距 */
  background-color: #f5f7fa; /* 页面背景色 */
  min-height: calc(100vh - 40px); /* 最小高度 */
  box-sizing: border-box;
}

.creator-card {
  max-width: 800px; /* 内容最大宽度 */
  margin: 0 auto; /* 水平居中 */
  border: 1px solid #e6e6e6; /* 轻微边框 */
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  i { /* 图标右边距 */
    margin-right: 8px;
    font-size: 20px; /* 图标稍大 */
    vertical-align: middle; /* 垂直对齐 */
  }
}

// --- 表单样式 ---
.creator-form {
  padding-top: 10px; /* 表单顶部留白 */
}

.el-form-item {
  margin-bottom: 24px; /* 表单项间距 */
}

/* 调整标签样式 */
.creator-form >>> .el-form-item__label {
  padding-bottom: 8px; /* 标签与控件间距 */
  font-weight: 500;
  line-height: 1.4;
  color: #606266;
}

// --- 上传区域样式 ---
.video-uploader >>> .el-upload-dragger {
  width: 100%; /* 拖拽区域宽度占满 */
  height: 200px; /* 增加拖拽区域高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #d9d9d9;
  border-radius: 6px;
  transition: border-color 0.3s;
  &:hover {
    border-color: #409EFF; /* 悬停时边框高亮 */
  }
  .el-icon-upload {
    font-size: 56px;
    color: #C0C4CC;
    margin: 0 0 18px; /* 图标与文字间距 */
  }
  .el-upload__text {
    color: #606266;
    font-size: 14px;
    em {
      color: #409EFF;
      font-style: normal;
    }
  }
}
.video-uploader >>> .el-upload__tip {
  line-height: 1.5;
  color: #909399;
  font-size: 13px;
  margin-top: 10px;
}
/* 文件列表项样式 (如果需要调整) */
.video-uploader >>> .el-upload-list__item {
  transition: background-color 0.2s;
}
.video-uploader >>> .el-upload-list__item:hover {
  background-color: #f5f7fa;
}

.reupload-button {
  // 样式已在模板中通过 style 设置 margin-top
}


// --- 分割线 ---
.el-divider--horizontal {
  margin: 30px 0; /* 增大上下间距 */
}
.el-divider i {
  margin-right: 6px;
  font-size: 16px;
  vertical-align: middle;
}
.el-divider__text {
  font-size: 14px;
  color: #606266;
  font-weight: 500; /* 加粗一点 */
  background-color: #f5f7fa; // 使文字背景与页面背景一致
  padding: 0 15px; // 左右留白
}

// --- 输入框和单选框 ---
.el-input, .el-textarea {
  // 无需特殊样式，Element UI 默认即可
}
.el-radio-group {
  line-height: 2; // 增加行高防止拥挤
}
.access-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 4px;
}

// --- 操作按钮 ---
.action-buttons {
  margin-top: 35px; /* 与上方表单项的距离 */
  text-align: right; /* 按钮右对齐 */
  .el-button {
    padding: 12px 30px; /* 增大按钮内边距 */
    font-size: 15px;    /* 按钮文字大小 */
  }
}

</style>
<!--

<template>
  <div>

    <el-container>
      <el-header style="height:100%">
        发布视频<br>
        <el-upload class="el-upload"
                   :file-list="fileList"
                   :http-request="uploadFile"
                   :on-change="handleChange"
                   :multiple="multiple"
                   :before-upload="beforeUpload"
        >
          <el-button @click="" v-show="fileList.length===0">选取文件</el-button>
        </el-upload>
        <br>
        <el-button @click="reUpload" v-show="fileList.length>0">重新上传</el-button>

      </el-header>
      <el-main>
        作品描述
        <el-input v-model="title" placeholder="填写作品标题，为作品获得更多流量"></el-input>
        <el-input v-model="description" placeholder="添加作品简介"></el-input>
        <el-radio v-model="access" label="0">公开</el-radio>
        <el-radio v-model="access" label="1">不公开</el-radio>
      </el-main>
      <el-footer>
        <el-button @click="submitVideo" :disabled="fileList.length===0">发布</el-button>
&lt;!&ndash;        <el-button @click="test(fileList.length)">test</el-button>&ndash;&gt;
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped lang="stylus">

</style>-->
