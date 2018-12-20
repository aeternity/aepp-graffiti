<template>
  <div class="w-full h-full">
    <div class="w-full h-full relative">
      <CanvasJS ref="canvas" :draggable=false></CanvasJS>
      <div v-if="showNavigation" class="ae-button-wrapper pin-t pin-l w-full">
        <span class="ae-navigation-button" @click="moveCanvas(0,10)">Up</span>
      </div>
      <div v-if="showNavigation" class="ae-button-wrapper pin-t pin-l h-full">
        <span class="ae-navigation-button" @click="moveCanvas(10,0)">Left</span>
      </div>
      <div v-if="showNavigation" class="ae-button-wrapper pin-b pin-l w-full ">
        <span class="ae-navigation-button" @click="moveCanvas(0,-10)">Down</span>
      </div>
      <div v-if="showNavigation" class="ae-button-wrapper pin-t pin-r h-full ">
        <span class="ae-navigation-button" @click="moveCanvas(-10,0)">Right</span>
      </div>
    </div>

    <div class="text-center p-4">
      <span class="mr-3">X: {{this.currentCoords.x}}</span>
      <span>Y: {{this.currentCoords.y}}</span>
    </div>
  </div>

</template>

<script>
  import CanvasJS from './CanvasJS.vue'
  import { getGoodImageDimensions } from '../helper'

  export default {
    name: 'CanvasWithControlls',
    components: { CanvasJS },
    props: ['showNavigation'],
    data () {
      return {
        currentCoords: {
          x: Math.round(this.$store.state.position.x),
          y: Math.round(this.$store.state.position.y)
        }
      }
    },
    computed: {
      transformedImage () {
        return this.$store.state.transformedImage
      },
      position () {
        return this.$store.state.position
      },
      settings () {
        return this.$store.state.settings
      }
    },
    methods: {
      getCurrentCoords () {
        return this.currentCoords
      },
      getPositionFromCanvas () {
        console.log(this.$refs.canvas.moveCanvas({ xDiff: 0, yDiff: 0 }))
      },
      moveCanvas (xDiff, yDiff, moveOverlay = true) {
        console.log('moving', xDiff, yDiff)
        this.$refs.canvas.moveCanvas({ xDiff, yDiff })
        if (moveOverlay) {
          this.$refs.canvas.moveOverlayImage(xDiff, yDiff)
          this.currentCoords.x -= xDiff
          this.currentCoords.y -= yDiff
        }
      }
    },
    mounted () {
      this.getPositionFromCanvas()
      const { width, height } = getGoodImageDimensions(
        this.transformedImage.width,
        this.transformedImage.height,
        200 * this.settings.scaleFactor,
        200 * this.settings.scaleFactor
      )

      this.$refs.canvas.addOverlayImage({
        src: this.transformedImage.src,
        position: this.position,
        width,
        height
      });

      const canvasSize = this.$refs.canvas.getCanvasDimensions()
      this.moveCanvas(
        -1 * this.position.x + canvasSize.width / 2 - width / 2,
        -1 * this.position.y + canvasSize.height / 2 - height / 2,
        false
      )
    }
  }
</script>

<style scoped>

  .ae-button-wrapper {
    @apply absolute flex items-center justify-center pointer-events-none;
  }

  .ae-navigation-button {
    @apply p-4 block cursor-pointer pointer-events-auto bg-white;
  }

</style>
