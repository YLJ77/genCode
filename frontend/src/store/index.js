import { createStore } from 'vuex'
import login from './modules/login'
import user from './modules/user'
import createPage from './modules/createPage'
import common from './common'

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    login,
    common,
    user,
    createPage
  }
})
