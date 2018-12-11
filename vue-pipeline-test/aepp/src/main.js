import Vue from 'vue'
import App from './App.vue'
import AeppComponents from '@aeternity/aepp-components'
import '@aeternity/aepp-components/dist/aepp.global.css'
import '@aeternity/aepp-components/dist/aepp.components.css'
import '@aeternity/aepp-components/dist/aepp.fonts.css'
import VueKonva from 'vue-konva'
import VueRouter from 'vue-router'
import getRouter from './router'
import store from './store'

Vue.config.productionTip = false
Vue.use(VueRouter)
Vue.use(AeppComponents)
Vue.use(VueKonva)

new Vue({
  router: getRouter(store),
  store,
  render: h => h(App),
  beforeCreate () {}
}).$mount('#app');