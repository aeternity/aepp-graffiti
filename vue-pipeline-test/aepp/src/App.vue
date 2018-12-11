<template>
  <div id="app">
    <div class="content">
      <ae-main>
        <ae-header name="Drone Project">
          <span class="text-white">test</span>
        </ae-header>
        <router-view></router-view>
      </ae-main>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'app',
    components: {},
    data () {
      return {
        goToRoute: 'home',
        amount: 0
      }
    },
    computed: { },
    mounted () { }
  }
</script>