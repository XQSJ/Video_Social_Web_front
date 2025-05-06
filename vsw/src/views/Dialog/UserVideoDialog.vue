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
      <!-- 播放器容器 -->
      <div ref="video" class="video-container" style="width: 100%;height: 500px" />
      <div v-if="dialogFormVisible">
        <div  class="video-description">
          {{this.video.title}}
          {{this.video.description}}
        </div>
        <div class="control-buttons" >
          <el-button @click="toUserPage(video.userId)">
            <el-avatar :size="60"
                       :src=" video.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'"></el-avatar>
            <!--
                          -->
            <br>
            {{ this.video.userId }}
          </el-button>
        </div>
        <div v-if="video.relation!==-1">
          <el-button @click="handleFollow(video)" v-show="video.isFollow===false">
            关注
          </el-button>
          <el-button @click="handleUnFollow(video)" v-show="video.isFollow===true">
            取消关注
          </el-button>
        </div>
        <el-button @click="handleLike(video)" v-show="video.isLike===false">
          点赞
          <br>{{ video.likeCount }}
        </el-button>
        <el-button @click="handleUnLike(video)" v-show="video.isLike===true">
          取消点赞<br>
          {{ video.likeCount }}
        </el-button>


      </div>


        <!-- 可以添加加载提示 -->
<!--        <div v-if="player===null" class="player-loading-placeholder">
            <i class="el-icon-loading"></i> 视频加载中...
        </div> -->

    </el-dialog>
</template>

<script>
import Player, {Events} from "xgplayer";
import axios from "axios";
import dayjs from "dayjs";

export default {
        name:'UserVideoDialog',
        data(){
            return{
                dialogFormVisible: false,
                video:null,
                player:null,
                userid:-1
            }
        },
      mounted(){
        this.$refs.dialog.rendered = true;
        if (localStorage.getItem('userInfo') !== null) {
          this.userid = JSON.parse(localStorage.getItem('userInfo')).userId
        }
      },
      methods:{
        saveHistory(player){
          let video = this.video

          let createTime = dayjs().format('YYYY-MM-DD HH:mm:ss')
          let interest = video.currentTime/player.duration
          let history={
            'userId':this.userid,
            'videoId':video.videoId,
            'currentTime':video.currentTime,
            'createTime':createTime,
            'interest':interest
          }
          console.log(history)
          axios.post('/history/create',history)
        },
        handleLike(v) {
          if (this.userid !== -1) {

            let like = {
              userId: this.userid,
              videoId: v.videoId
            }
            axios.post('/like/likeVideo', like).then(response => {
              if (response.data.code === 1) {
                //将其设置为已喜欢
                v.isLike = true
                v.likeCount = v.likeCount + 1
               // this.$set(this.videoList, index, v);
              } else {
                this.$message.error(response.data.data);

              }
            })
          } else {
            this.toLoginView();
          }
        },
        handleUnLike(v) {
          if (this.userid !== -1) {


            let like = {
              userId: this.userid,
              videoId: v.videoId
            }
            axios.post('/like/unlikeVideo', like).then(response => {
              if (response.data.code === 1) {
                //将其设置为不喜欢
                v.isLike = false
                v.likeCount = v.likeCount - 1
                //this.$set(this.videoList, index, v);
              } else {
                this.$message.error(response.data.data);


              }
            })
          } else {
            this.toLoginView();
          }
        },
          handleFollow(v){
            if(this.userid!==-1){
              let followid = v.userId

              axios.post(`/follow/${this.userid}/${followid}`)
                  .then(response => {
                    if (response.data.code === 1) {
                      this.$message(this.userid + "已关注" + followid)

                     /* for (let i in this.videoList) {
                        let temp = this.videoList[i]
                        if (temp.userId === followid) {

                          this.$delete(this.videoList[i], "isFollow")
                          this.$set(this.videoList[i], "isFollow", true);
                          let relation = temp.relation + 1
                          this.$delete(this.videoList[i], "relation")
                          this.$set(this.videoList[i], "relation", relation);

                        }
                      }*/
                    } else {
                      this.$message.error(response.data.data);

                    }

                  })
            } else {
              //console.log('未登录')
              this.toLoginView();
            }
          },
        handleUnFollow(v){
          if(this.userid!==-1){
            let followid = v.userId
            axios.delete(`/follow/${this.userid}/${followid}`)
                .then(response => {
                  if (response.data.code === 1) {
                    this.$message(this.userid + "已取消关注" + followid)

              /*      for (let i in this.videoList) {
                      let temp = this.videoList[i]
                      if (temp.userId === followid) {
                        this.$delete(this.videoList[i], "isFollow")
                        this.$set(this.videoList[i], "isFollow", false);
                        let relation = temp.relation - 1
                        this.$delete(this.videoList[i], "relation")
                        this.$set(this.videoList[i], "relation", relation);

                      }
                    }*/
                  } else {
                    this.$message.error(response.data.data);

                  }

                })
          } else {
            this.toLoginView();
          }
        },
          closeDialog(){
           // this.video.playTime = this.video.playTime+(this.player.currentTime-this.video.currentTime);


            this.player.destroy();
            this.player=null;
            this.dialogFormVisible = false;
          },
        async showDialog(videoId){
            this.video =  await this.getVideo(videoId, this.userid);

            let videoUrl = await this.getUrl(this.video.path);
            this.player = this.initPlayer(videoUrl)


            this.dialogFormVisible = true
          },
        interestVideo(player){
              let video = this.video

        },
        initPlayer(videoUrl){
          const player = new Player({
            el: this.$refs.video,
            url: videoUrl,
            startTime:this.video.currentTime,
            plugins: [],
            poster: '',
            width: '100%',
            height: '100%',
            autoplay: false,
          })

          player.once(Events.PLAY,(data)=>{
            this.saveHistory();
          })

          player.on(Events.PLAY,(data)=>{
            this.video.currentTime=data.currentTime;

          })

          player.on(Events.PAUSE,(data)=>{
            /*console.log("pause",index)*/
           /* console.log(data.currentTime)*/
            this.video.playTime = this.video.playTime+(data.currentTime-this.video.currentTime);

            this.video.currentTime=data.currentTime;
     /*       if(this.userid!==-1 ){
              if(data.ended===false)
                this.saveHistory();
            }*/
          })
          player.on(Events.ENDED,(data)=>{
              this.player.play()
          })

          player.once(Events.DESTROY,(data)=>{
            this.video.currentTime=this.player.currentTime;

            this.saveHistory(data);
          })
          return player;
        },
        async getUrl(path) {
          return await axios.get(`/video/getUrl/${path}`).then((response) => {
            if (response.data.code === 1) {
              //console.log('resoponse',response.data.data)
              return response.data.data.videoUrl;
            } else {
              return ''
            }
          })
        },
        toUserPage(userid) {

           //this.closeDialog()
          this.toUserView(userid)
        },
        async getVideo(videoId, userId) {
          return await axios.get(`/video/getVideo/${userId}/${videoId}`).then((response) => {
            if (response.data.code === 1) {

              let video = response.data.data
              video.isFollow = video.relation !== 0

              video.playTime = 0;
              video.startTime = video.currentTime;
              return video
            }
          })
        },
      }
    }
</script>

<style scoped>
.dialog {
  width: 100%;
  height: 100%

}
.video-description {
  position: absolute;
  z-index: 100; /* 确保高于播放器 */
  bottom: 20px; /* 距离底部20px */
  align-items: flex-start; /* 左对齐 */
  color: white
}

/* 添加以下样式 */
.control-buttons {
  position: absolute;
  z-index: 100; /* 确保高于播放器 */
  bottom: 20px; /* 距离底部20px */
  right: 20px; /* 距离右侧20px */
  display: flex;
  flex-direction: column; /* 竖向排列 */
  align-items: flex-end; /* 右对齐 */
  pointer-events: auto !important; /* 强制启用点击事件 */
}

.control-buttons .el-button {
  margin: 5px 0; /* 设置上下间距 */
  pointer-events: auto !important; /* 确保按钮可点击 */
}
</style>