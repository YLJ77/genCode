import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/home',
    component: () => import('@/views/Home'),
    children: [
      {
        path: 'user',
        component: () => import('@/views/User')
      },
      {
        path: 'create-page',
        component: () => import('@/views/CreatePage')
      },
      {
        path: 'black-list',
        component: () => import('@/views/BlackList')
      },
    ]
  },
  {
    path: '/test',
    component: () => import('@/views/Test.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
