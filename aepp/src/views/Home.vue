<template>
  <div>
    <WhiteHeader title="Drone Graffiti"></WhiteHeader>

    <div class="w-full h-full">
      <CanvasJS @error="showErrorOverlay" :height="height" :draggable=true :fill-scale=true ref="canvas"></CanvasJS>
    </div>
    <div @click="$router.push('contribute')" class="absolute pin-b pin-r p-8 ">
      <ae-icon name="plus" fill="primary" face="round"
               class="ae-icon-size shadow"></ae-icon>
    </div>
    <div @click="reloadCanvas" class="absolute pin-b p-8 ">
      <ae-icon name="reload" fill="primary" face="round"
               class="ae-icon-size shadow"></ae-icon>
    </div>
    <ae-backdrop class="p-6" v-show="backDropVisible">
      <ae-card>
        <div class="w-full">
          <h1 class="font-mono text-red text-center pt-4">ERROR</h1>
          <p class="text-base text-red pt-4 text-center">
            Could not connect to our server. Please make sure you are online.
          </p>
          <div class="flex justify-center mt-6">
            <ae-button fill="primary" face="round" @click="$router.go()">Retry</ae-button>
          </div>
        </div>
      </ae-card>
    </ae-backdrop>
  </div>
</template>

<script>
  import CanvasJS from '@/components/CanvasJS.vue'
  import WhiteHeader from '@/components/WhiteHeader'
  import { AeBackdrop, AeButton, AeCard, AeIcon } from '@aeternity/aepp-components/'

  export default {
    name: 'Home',
    components: { AeButton, AeBackdrop, AeIcon, AeCard, WhiteHeader, CanvasJS },
    data () {
      return {
        height: window.innerHeight - 64,
        backDropVisible: false
      }
    },
    methods: {
      reloadCanvas () {
        this.$refs.canvas.updateBackgroundImage()
      },
      showErrorOverlay () {
        console.log('ERR')
        this.backDropVisible = true
      }
    },
    mounted () {
      if (this.$store.state.firstTimeOpened) this.$router.push('onboarding')
    }
  }
</script>

<style scoped>
  .ae-icon-size {
    transform: scale(1.8)
  }

</style>
