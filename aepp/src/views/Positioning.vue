<template>
  <div>
    <InfoLayer>
      <h2>Positioning</h2>
      <p class="p-4 pb-0">
        Drag and drop the artwork to your desired position on the wall. You can pinch to zoom and drag to move.
      </p>
      <p class="p-4 pb-0">
        To adjust the size of your artwork use the scale slider down below. For more detailed positioning you can enter the X and Y coordinates in the in put fields below.
      </p>
    </InfoLayer>

    <div class="w-full pl-8 pr-8">
      <h1 class="w-full text-center">Positioning</h1>
    </div>
    <div class="w-full pt-4">
        <CanvasWithControlls :draggable=true :showToggle="true" :showScale="true" ref="canvas"></CanvasWithControlls>
    </div>
    <div class="w-full p-8 pt-0">
      <ae-list>
        <ae-list-item>
          <ae-button face="round" fill="primary" @click="next" extend>Continue</ae-button>
        </ae-list-item>
        <ae-list-item @click="back" class="justify-center">
          <ae-text face="uppercase-base" weight="bold">Adjust Image Style</ae-text>
        </ae-list-item>
      </ae-list>
    </div>
  </div>
</template>

<script>
  import CanvasWithControlls from '../components/CanvasWithControlls.vue'
  import InfoLayer from '@/components/InfoLayer'

  export default {
    name: 'Positioning',
    components: { InfoLayer, CanvasWithControlls },
    data () {
      return {
        scale: 1
      }
    },
    methods: {
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

</style>
