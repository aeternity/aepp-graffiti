<template>
  <div>
    <WhiteHeader title="Drone Graffiti"></WhiteHeader>

    <div class="w-full h-full">
      <CanvasJS :height="height" :draggable=true :fill-scale=true></CanvasJS>
    </div>
    <div @click="$router.push('contribute')" class="absolute pin-b pin-r p-8 ">
      <ae-icon name="plus" fill="primary" face="round"
               class="ae-icon-size shadow"></ae-icon>
    </div>
  </div>
</template>

<script>
  import CanvasJS from '../components/CanvasJS.vue'
  import WhiteHeader from '@/components/WhiteHeader'
  import {AeIcon} from '@aeternity/aepp-components/'

  export default {
    name: 'Home',
    components: {AeIcon, WhiteHeader, CanvasJS},
    data() {
      return {
        height: window.innerHeight - 64
      }
    },
    mounted() {
      if (this.$store.state.firstTimeOpened) this.$router.push('onboarding')
    }
  }
</script>

<style scoped>
  .ae-icon-size {
    transform: scale(1.8)
  }

</style>
