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

export default () => {
  const routes = [
    {
      path: '/',
      name: 'home',
      component: Home,
      props: route => ({ query: route.query })
    },
    {
      path: '/contribute',
      name: 'contribute',
      component: Contribute,
      props: route => ({ query: route.query })
    },
    {
      path: '/render',
      name: 'render',
      component: Render,
      props: route => ({ query: route.query })
    },
    {
      path: '/positioning',
      name: 'positioning',
      component: Positioning,
      props: route => ({ query: route.query })
    },
    {
      path: '/confirm',
      name: 'confirm',
      component: Confirm,
      props: route => ({ query: route.query })
    },
    {
      path: '/overview',
      name: 'overview',
      component: Overview,
      props: route => ({ query: route.query })
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: Onboarding,
      props: route => ({ query: route.query })
    },
    {
      path: '/slots',
      name: 'slots',
      component: Slots,
      props: route => ({ query: route.query })
    },
    {
      path: '/desktop/canvas',
      name: 'canvas',
      component: Canvas,
      props: route => ({ query: route.query })
    },
    {
      path: '/desktop/admin',
      name: 'admin',
      component: Admin,
      props: route => ({ query: route.query })
    }
  ]
  return new Router({mode: 'history', routes: routes})
}
