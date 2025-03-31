import './assets/css/icons.styl'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/all.styl'
import axios from "axios";
import {url} from '../src/request/http'


import OSS from '../public/lib/aliyun-upload-sdk-1.5.6/lib/aliyun-oss-sdk-6.17.1.min'
window.OSS = OSS;
import '../public/lib/aliyun-upload-sdk-1.5.6/aliyun-upload-sdk-1.5.7.min'
/*import {Promise} from "es6-promise";
window.Promise = Promise*/
/*import { register } from 'swiper/element/bundle';

register();*/
//引入element组件
import ElementUI from 'element-ui'; // 2.1引入结构
import 'element-ui/lib/theme-chalk/index.css'; // 2.2引入样式

axios.defaults.baseURL = url;
Vue.use(ElementUI); // 3.安装

Vue.config.productionTip = false
// 在Vue实例创建之前设置silent为true
Vue.config.silent = true;



Vue.prototype.getUser=function (userId){
  return  axios
      .get(`/users/${userId}`)
      .then((response)=>{
        if (response.data.code === 1) {
          //console.log(response.data.data)
          return response.data.data
        }else {
          this.$message.error(response.data.data);
          console.log(response.data.data)
          return null
        }
      })
};
Vue.prototype.toUserView=function (userid){
  this.$router.push({
    name:'user',
    query:{
      id:userid
    },
  }, () => {});
}

router.beforeEach((to,from,next)=>{

  if(to.name==='search'){
    //当路由跳转到搜索界面，通过钩子回调赋值
    next(vm=>{

      vm.$data.searching=to.query.key
    })
  }
  if(to.name==='user'){

    //当路由跳转到用户界面，通过钩子回调赋值
    next(vm=>{

      vm.$data.userid=to.query.user
    })
  }
  next()

})

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')