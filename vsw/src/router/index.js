import Vue from 'vue'
import VueRouter from 'vue-router'

import RecommendView from "@/views/RecommendView.vue";
import FollowView from "@/views/FollowView.vue";
import SearchView from "@/views/SearchView.vue";
import UserView from "@/views/UserView.vue";


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'recommend',
    component: RecommendView
  },
  {
    path: '/follow',
    name: 'follow',
    component: FollowView
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
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
