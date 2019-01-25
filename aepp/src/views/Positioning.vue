<template>
  <div>
    <InfoLayer>
      <h2>Positioning</h2>
      <p class="p-4 pb-0">
        Drag and drop the artwork to your desired position on the wall. You can pinch to zoom and drag to move.
      </p>
      <p class="p-4 pb-0">
        To adjust the size of your artwork use the scale slider down below. For more detailed positioning you can enter
        the X and Y coordinates in the in put fields below.
      </p>
    </InfoLayer>
    <WhiteHeader :back="back" title="Place Your Artwork"></WhiteHeader>
    <div class="w-full h-full">
      <CanvasWithControlls :height=height :draggable=true :greyed-out=true ref="canvas"></CanvasWithControlls>
    </div>
    <div class="w-full absolute pin-b">
      <div class="m-8 mb-6 mt-0 flex flex-row items-center justify-between">
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
  import InfoLayer from '@/components/InfoLayer'
  import WhiteHeader from '@/components/WhiteHeader'
  import { AeButton } from '@aeternity/aepp-components';

  export default {
    name: 'Positioning',
    components: { WhiteHeader, InfoLayer, CanvasWithControlls, AeButton },
    data () {
      return {
        scale: 1,
        height: window.innerHeight - 64
      }
    },
    methods: {
      minus () {
        this.$refs.canvas.changeOverlayScale(-0.1)
      },
      plus () {
        this.$refs.canvas.changeOverlayScale(0.1)
      },
      back () {
        this.$router.push('render')
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
