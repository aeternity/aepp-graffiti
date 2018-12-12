import Router from 'vue-router'
import Home from './components/Home.vue'
import Contribute from './components/Contribute.vue'
import Render from './components/Render.vue'
import Positioning from './components/Positioning.vue'
import Confirm from './components/Confirm.vue'

export default (store) => {
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
    }
  ]
  const router = new Router({mode: 'history', routes: routes})
  return router
}
