<template>
  <div id="app" class="min-h-screen">
    <div class="content min-h-screen">
      <ae-main class="min-h-screen" >
        <router-view></router-view>
      </ae-main>
      <!-- Find the docs for the component here: http://aeternity.com/aepp-components/ -->
    </div>
    <CriticalErrorOverlay
      :error="error"
      :errorClick="errorClick"
      :errorCTA="errorCTA"
    ></CriticalErrorOverlay>
  </div>
</template>

<script>

  import { AeMain } from '@aeternity/aepp-components'
  import CriticalErrorOverlay from '@/components/CriticalErrorOverlay'

  export default {
    name: 'app',
    components: { CriticalErrorOverlay, AeMain },
    data() {
      return {
        error: null,
        errorCTA: null,
        ignoreErrors: (window.location.host.includes('localhost')),
        errorClick: () => {}
      }
    },
    created() {
      if(window.parent === window && !this.ignoreErrors && !this.$route.path.includes('desktop')) {
        // SET ERROR
        this.error = 'Could not connect to your wallet. Please make sure you run this application inside the base aepp.'
        this.errorCTA = 'Go to Base Aepp'
        this.errorClick = () => {
          window.location.href = 'https://base-aepp.dronegraffiti.com/'
        }
      }
    }
  }
</script>

<style scoped>
  .min-h-screen {
    min-height: 100vh;
    padding-bottom: 0;
  }
</style>
