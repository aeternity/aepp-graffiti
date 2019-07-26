<template>
  <div>
    <WhiteHeader :back="back" title="Place Your Artwork">
      <h2>Place Your Artwork</h2>
      <p class="p-4 pb-0">
        Drag and drop the artwork to your desired position on the wall. You can pinch to zoom and drag to move.
      </p>
      <p class="p-4 pb-0">
        To adjust the size of your artwork use the scale - and + buttons down below.
      </p>
    </WhiteHeader>
    <div class="w-full h-full relative">
      <CanvasWithControlls :height=height :draggable=true :greyed-out=true ref="canvas"></CanvasWithControlls>
    </div>
    <div class="w-full absolute bottom-0">
      <div class="w-full flex justify-center mb-6" v-show="error" @click="error = false">
        <Toast>
            Scaling failed. Are you too close to the edge?
        </Toast>
      </div>
      <div class="mx-8 mb-6 flex flex-row items-center justify-between">
        <div class="flex flex-row">
          <div @click="minus" class="rounded-full w-12 h-12 ae-color-secondary flex justify-center items-center mr-4">
            <span class="text-2xl text-white">&minus;</span>
          </div>
          <div @click="plus" class="rounded-full w-12 h-12 ae-color-secondary flex justify-center items-center">
            <span class="text-2xl text-white">+</span>
          </div>
        </div>
        <ae-button face="round" fill="primary" @click="next">Place Art</ae-button>
      </div>
    </div>

  </div>
</template>

<script>
  import CanvasWithControlls from '../components/CanvasWithControlls.vue'
  import WhiteHeader from '~/components/WhiteHeader'
  import { AeButton } from '@aeternity/aepp-components'
  import Toast from '../components/Toast'

  export default {
    name: 'Positioning',
    components: { Toast, WhiteHeader, CanvasWithControlls, AeButton },
    data () {
      return {
        scale: 1,
        height: window.innerHeight - 64,
        error: false
      }
    },
    methods: {
      async minus () {
        const success = await this.$refs.canvas.changeOverlayScale(-0.1)
        if(!success) this.showError()
      },
      async plus () {
        const success = await this.$refs.canvas.changeOverlayScale(0.1)
        if(!success) this.showError()
      },
      back () {
        this.$router.push('render')
      },
      showError() {
        this.error = true
        setTimeout(() => this.error = false, 2000)
      },
      next () {
        const { x, y } = this.$refs.canvas.getOverlayPosition()
        this.$store.dispatch(`updatePosition`, { x: Math.round(x), y: Math.round(y) })
        this.$router.push('slots')
      }
    }
  }
</script>

<style scoped>
  .ae-color-secondary {
    background: #6948a1
  }

</style>
