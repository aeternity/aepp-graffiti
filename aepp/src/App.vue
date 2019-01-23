<template>
  <div id="app" class="min-h-screen">
    <div class="content min-h-screen">
      <ae-main class="min-h-screen" >
        <router-view></router-view>
      </ae-main>
      <!-- Find the docs for the component here: http://aeternity.com/aepp-components/ -->
    </div>
  </div>
</template>

<script>

  import { AeMain } from '@aeternity/aepp-components'


  export default {
    name: 'app',
    components: { AeMain },

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

<style scoped>
  .min-h-screen {
    min-height: 100vh;
    padding-bottom: 0;
  }
</style>
