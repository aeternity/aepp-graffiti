// import socketio from 'socket.io'
import './main.css'
import 'tailwindcss';

/**
 * Use this if you need a general reset.
 *
 * Includes global style changes like:
 *
 * - all needed fonts
 * - normalize.css
 *
 * html, body {} styles (like font, font-size)
 * p {}
 * h1, h2, h3, h4, h5, h6 {}
 */
// import '@aeternity/aepp-components/dist/aepp.global.css'

/**
 * This will only include font files
 */
import '@aeternity/aepp-components/dist/aepp.fonts.css'

/**
 * These are all components styles. They're scoped
 * so they won't collide with other styles.
 */
import '@aeternity/aepp-components/dist/aepp.components.css'

import Vue from 'vue'
import VueRouter from 'vue-router'
import App from './App.vue'
import getRouter from './router'
import store from './store'
import VueKonva from 'vue-konva'
import VueMeta from 'vue-meta'

/**
 * Documentation of the new components are here.
 *
 * http://aeternity.com/aepp-components/
 */
import Components from '@aeternity/aepp-components'

Vue.use(VueRouter)
Vue.use(Components)
Vue.use(VueKonva)
Vue.use(VueMeta);

Vue.config.productionTip = false

console.info('about to render Vue App')

/**
 * I would suggest exporting this Vue instance.
 *
 * In the future it might turn useful if you want to reference it
 * from some other packages that have no relation with VueJS
 *
 * Also looks nice.
 */
export default new Vue({
  router: getRouter(store),
  store,
  render: h => h(App),
  beforeCreate () {}
}).$mount('#app')
