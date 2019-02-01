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
    components: { AeMain }
  }
</script>

<style scoped>
  .min-h-screen {
    min-height: 100vh;
    padding-bottom: 0;
  }
</style>
