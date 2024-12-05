import './assets/css/icons.styl'
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './assets/css/all.styl'

//引入element组件
import ElementUI from 'element-ui'; // 2.1引入结构
import 'element-ui/lib/theme-chalk/index.css'; // 2.2引入样式
Vue.use(ElementUI); // 3.安装

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: function (h) { return h(App) }
}).$mount('#app')

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