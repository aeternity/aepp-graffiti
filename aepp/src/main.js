import './main.css'

import '@aeternity/aepp-components/dist/aepp.fonts.css'
import '@aeternity/aepp-components/dist/ae-icon/ae-icon.css'

import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import router from './router'
import store from './store'

Vue.use(VueRouter)
Vue.config.productionTip = false

export default new Vue({
  router: router,
  store,
  render: h => h(App)
}).$mount('#app')
