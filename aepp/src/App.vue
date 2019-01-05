<template>
  <div id="app">
    <div class="content">
      <ae-main>
        <ae-header name="Drone Project"></ae-header>
        <router-view></router-view>
      </ae-main>

      <!-- Find the docs for the component here: http://aeternity.com/aepp-components/ -->
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app',

    //TODO there has to be a better solution than this
    metaInfo: {
      meta: [
        { name: 'viewport', content: 'initial-scale=1.0,width=device-width,user-scalable=0' }
      ]
    },

    data () {
      return {
        goToRoute: ''
      }
    }
  }
</script>
