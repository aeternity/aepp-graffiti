import Router from 'vue-router'
import Home from './views/Home.vue'
import Contribute from './views/Contribute.vue'
import Render from './views/Render.vue'
import Positioning from './views/Positioning.vue'
import Confirm from './views/Confirm.vue'
import Test from './views/Test.vue'
import Desktop from './views/Desktop'
import Overview from './views/Overview'
import IFrame from './views/IFrame'
import Onboarding from './views/Onboarding'

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
      path: '/desktop',
      name: 'desktop',
      component: Desktop,
      props: route => ({ query: route.query })
    },
    {
      path: '/iframe',
      name: 'iframe',
      component: IFrame,
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
      path: '/test',
      name: 'test',
      component: Test,
      props: route => ({ query: route.query })
    }
  ]
  return new Router({mode: 'history', routes: routes})
}
