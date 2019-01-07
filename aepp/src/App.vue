<template>
  <div id="app">
    <div class="content">
      <ae-main v-if="this.$route.path !== '/iframe'" >
        <ae-header name="Drone Project"></ae-header>
        <router-view></router-view>
      </ae-main>
      <router-view v-else></router-view>
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
    },
    created() {
      console.log(this.$route.path)
    }
  }
</script>
