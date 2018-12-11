<template>
  <div class="w-full h-full relative">
    <CanvasJS ref="canvas"></CanvasJS>
    <div class="ae-button-wrapper pin-t pin-l w-full">
      <span class="ae-navigation-button" @click="moveCanvas(0,10)">Up</span>
    </div>
    <div class="ae-button-wrapper pin-t pin-l h-full">
      <span class="ae-navigation-button" @click="moveCanvas(10,0)">Left</span>
    </div>
    <div class="absolute flex items-center justify-center pin-b pin-l w-full pointer-events-none">
      <span class="ae-navigation-button" @click="moveCanvas(0,-10)">Down</span>
    </div>
    <div class="absolute flex items-center justify-center pin-t pin-r h-full pointer-events-none">
      <span class="ae-navigation-button" @click="moveCanvas(-10,0)">Right</span>
    </div>
  </div>
</template>

<script>
  import CanvasJS from './CanvasJS.vue'

  export default {
    name: 'CanvasWithControlls',
    components: { CanvasJS },
    methods: {
      getPositionFromCanvas () {
        console.log(this.$refs.canvas.moveCanvas({ xDiff: 0, yDiff: 0 }))
      },
      moveCanvas (xDiff, yDiff) {
        this.$refs.canvas.moveCanvas({ xDiff, yDiff })
      }
    },
    mounted () {
      this.getPositionFromCanvas()
      this.$refs.canvas.addOverlayImage({
        src: `https://picsum.photos/200/300/?random`,
        position: { x: Math.random(), y: Math.random() }
      });
      this.moveCanvas(0, 10)
    }
  }
</script>

<style scoped>

  .ae-button-wrapper {
    @apply absolute flex items-center justify-center pointer-events-none;
  }
  .ae-navigation-button {
    @apply p-4 block cursor-pointer pointer-events-auto;
  }

</style>
