// import socketio from 'socket.io'
import './main.css'
import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import getRouter from './router'
import store from './store'
import AeppComponents from '@aeternity/aepp-components'
import VueKonva from 'vue-konva'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(AeppComponents)
Vue.use(VueKonva)

console.info('about to render Vue App')
new Vue({
  router: getRouter(store),
  store,
  render: h => h(App),
  beforeCreate () {}
}).$mount('#app')
