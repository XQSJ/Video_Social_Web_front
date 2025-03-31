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
          this.userid=JSON.parse(localStorage.getItem('userInfo')).userId
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
<!--        <el-button @click="test(fileList.length)">test</el-button>-->
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped lang="stylus">

</style>