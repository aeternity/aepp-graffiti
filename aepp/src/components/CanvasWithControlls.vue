<template>
  <div class="w-full h-full">
    <CanvasJS @positionUpdate="updateVisualPosition" ref="canvas" :draggable=true></CanvasJS>
    <div class="text-center p-4">
      <span class="mr-3">X: {{this.x}}</span>
      <span>Y: {{this.y}}</span>
    </div>
  </div>

</template>

<script>
  import CanvasJS from './CanvasJS.vue'
  import { getGoodImageDimensions } from '../helper'

  export default {
    name: 'CanvasWithControlls',
    components: { CanvasJS },
    data() {
      return {
        x: this.$store.state.position.x,
        y: this.$store.state.position.y
      }
    },
    props: ['scale'],
    computed: {
      transformedImage () {
        return this.$store.state.transformedImage
      },
      position () {
        return this.$store.state.position
      },
      settings () {
        return this.$store.state.settings
      },
      canvasSettings () {
        return this.$store.state.canvas
      },
    },
    methods: {
      updateVisualPosition({x, y}) {
        this.x = Math.round(x)
        this.y = Math.round(y)
      },
      moveCanvas (xDiff, yDiff) {
        this.$refs.canvas.moveCanvas({ xDiff, yDiff })
      },
      getOverlayPosition () {
        return this.$refs.canvas.getOverlayPosition()
      }
    },
    watch: {
      scale() {
        this.$refs.canvas.setOverlayImageSize(
          this.transformedImage.width * this.scale,
          this.transformedImage.height * this.scale
        )
      }
    },
    mounted () {

      this.$refs.canvas.addOverlayImage({
        src: this.transformedImage.src,
        position: this.position,
        width: this.transformedImage.width,
        height: this.transformedImage.height
      })


      const canvasSize = this.$refs.canvas.getStageDimensions()

      this.moveCanvas(
        -1 * this.position.x + canvasSize.width / 2 - this.transformedImage.width / 2,
        -1 * this.position.y + canvasSize.height / 2 - this.transformedImage.height / 2,
      )

      this.$refs.canvas.setStageScale(0.4)

    }
  }
</script>

<style scoped>

  .ae-button-wrapper {
    @apply absolute
    flex items-center justify-center pointer-events-none;
  }

  .ae-navigation-button {
    @apply p-4
    block cursor-pointer pointer-events-auto bg-white;
  }

</style>
