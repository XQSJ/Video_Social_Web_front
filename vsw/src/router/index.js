import Vue from 'vue'
import VueRouter from 'vue-router'

import RecommendView from "@/views/Recommend/RecommendView.vue";
import FollowView from "@/views/Follow/FollowView.vue";
import SearchView from "@/views/SearchView.vue";
import UserView from "@/views/UserView.vue";
import CreatorView from "@/views/CreatorView.vue";
import LoginView from "@/views/LoginView.vue";


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'recommend',
    component: RecommendView,
    meta:{
      keepAlive:true
    }
  },
  {
    path: '/follow',
    name: 'follow',
    component: FollowView,
    meta:{
      keepAlive:true
    }
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView
  },
  {
    path: '/user',
    name: 'user',
    component: UserView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path:'/creator',
    name: 'creator',
    component: CreatorView
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
