<template>
  <ae-main>
    <ae-header :name="`Drone Project`">
      <span class="text-white">test</span>
    </ae-header>
    <div class="w-full p-4 flex flex-col">
      <h1 class="mb-4">Your Aepp</h1>
      <Canvas></Canvas>
    </div>
    <ae-button>test</ae-button>
  </ae-main>
</template>

<script>
  import Canvas from './Canvas.vue'
  export default {
    name: 'Home',
    components: { Canvas },

  }
</script>

<style scoped>

</style>
