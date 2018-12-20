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
    data () {
      return {
        goToRoute: '',
        amount: 0
      }
    }
  }
</script>
