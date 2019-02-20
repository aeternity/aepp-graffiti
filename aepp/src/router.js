import Router from 'vue-router'
import Home from './views/Home.vue'
import Contribute from './views/Contribute.vue'
import Render from './views/Render.vue'
import Positioning from './views/Positioning.vue'
import Confirm from './views/Confirm.vue'
import Overview from './views/Overview'
import Onboarding from './views/Onboarding'
import Slots from './views/Slots'
import Canvas from './views/desktop/Canvas'
import Admin from './views/desktop/Admin'
import Teaser from './views/desktop/Teaser'
import Amount from './views/Amount'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    meta: { title: `Home` },
  },
  {
    path: '/contribute',
    name: 'contribute',
    component: Contribute,
    meta: { title: `Contribute` },
  },
  {
    path: '/render',
    name: 'render',
    component: Render,
    meta: { title: `Render` },
  },
  {
    path: '/positioning',
    name: 'positioning',
    component: Positioning,
    meta: { title: `Positioning` },
  },
  {
    path: '/confirm',
    name: 'confirm',
    component: Confirm,
    meta: { title: `Confirm` },
  },
  {
    path: '/overview',
    name: 'overview',
    component: Overview,
    meta: { title: `Overview` },
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: Onboarding,
    meta: { title: `Onboarding` },
  },
  {
    path: '/slots',
    name: 'slots',
    component: Slots,
    meta: { title: `Slots` },
  },
  {
    path: '/amount',
    name: 'amount',
    component: Amount,
    meta: { title: `Amount` },
  },
  {
    path: '/desktop/canvas',
    name: 'canvas',
    component: Canvas,
    meta: { title: `Canvas` },
  },
  {
    path: '/desktop/admin',
    name: 'admin',
    component: Admin,
    meta: { title: `Admin` },
  },
  {
    path: '/desktop/teaser',
    name: 'teaser',
    component: Teaser,
    meta: { title: `Teaser` },
  }
]

const router = new Router({ mode: 'history', routes: routes })

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title} - Drone Aepp`
  next()
})

export default router;
