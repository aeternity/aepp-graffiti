<template>
  <div id="app">
    <div class="content">
      <ae-main>
        <ae-header name="Drone Project">
          <span class="text-white">test</span>
        </ae-header>
        <router-view></router-view>
      </ae-main>

      <!-- Find the docs for the component here: http://aeternity.com/aepp-components/ -->
      <ae-badge>Hello world</ae-badge>
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
    },
    computed: { },
    mounted () { }
  }
</script>
