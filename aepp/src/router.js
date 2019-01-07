import Router from 'vue-router'
import Home from './components/Home.vue'
import Contribute from './components/Contribute.vue'
import Render from './components/Render.vue'
import Positioning from './components/Positioning.vue'
import Confirm from './components/Confirm.vue'
import Test from './components/Test.vue'
import Desktop from './components/Desktop'
import Success from './components/Success'
import Overview from '@/components/Overview'
import IFrame from '@/components/IFrame'

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
      path: '/success',
      name: 'success',
      component: Success,
      props: route => ({ query: route.query })
    },
    {
      path: '/overview',
      name: 'overview',
      component: Overview,
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
