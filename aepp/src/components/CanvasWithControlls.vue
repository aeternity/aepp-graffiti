<template>
  <div class="w-full h-full">
    <div class="border-b border-t border-grey-darker">
      <CanvasJS @positionUpdate="updateVisualPosition" ref="canvas" :draggable=draggable></CanvasJS>
    </div>
    <div class="p-4 flex flex-row" v-if="draggable">
      <ae-input label="X" type="number" :value=x class="mr-3 text-center"></ae-input>
      <ae-input label="Y" type="number" :value=y class="text-center"></ae-input>
    </div>
    <div class="p-4 flex flex-row" v-else>
      <ae-input label="X" :value=x disabled class="mr-3 text-center"></ae-input>
      <ae-input label="Y" :value=y disabled class="text-center"></ae-input>
    </div>
  </div>

</template>

<script>
  //TODO disable ae-inputs (not yet possible)
  //TODO add listener for blur / change to ae-inputs not possible yet
  import CanvasJS from './CanvasJS.vue'

  export default {
    name: 'CanvasWithControlls',
    components: { CanvasJS },
    data() {
      return {
        x: this.$store.state.position.x,
        y: this.$store.state.position.y
      }
    },
    props: ['scale', 'draggable'],
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

</style>
