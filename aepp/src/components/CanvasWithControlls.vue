<template>
  <div class="w-full h-full">
    <CanvasJS :fillScale="true" @positionUpdate="updateVisualPosition" :height=height ref="canvas" :draggable=draggable :greyed-out=greyedOut></CanvasJS>
  </div>
</template>

<script>
  import CanvasJS from './CanvasJS.vue'
  import config from '@/config'

  export default {
    name: 'CanvasWithControlls',
    components: { CanvasJS },
    data () {
      return {
        x: this.$store.state.position.x,
        y: this.$store.state.position.y
      }
    },
    props: {
      'draggable': {
        type: Boolean,
        default: false
      },
      'height': {
        type: Number,
        default: 300
      },
      'greyedOut': {
        type: Boolean,
        default: false
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
      },
      canvasSettings () {
        return config.canvas
      },
    },
    methods: {
      updateVisualPosition ({ x, y }) {
        this.x = Math.round(x)
        this.y = Math.round(y) // eslint-disable-line
      },
      moveCanvas (xDiff, yDiff) {
        this.$refs.canvas.moveCanvas({ xDiff, yDiff })
      },
      getOverlayPosition () {
        return this.$refs.canvas.getOverlayPosition()
      },
      async changeOverlayScale (scaleDiff) {
        await this.$store.dispatch('updatePosition', {
          x: this.x,
          y: this.y
        })
        await this.$store.dispatch('updateSettings', {
          scaleFactor: this.settings.scaleFactor + scaleDiff
        })
        this.updateOverlayImage()
      },

      updateOverlayImage () {
        this.$refs.canvas.updateOverlayImageSource({
          src: this.transformedImage.src,
          width: this.transformedImage.width,
          height: this.transformedImage.height
        })
      }
    },
    mounted () {
      this.$refs.canvas.addOverlayImage({
        src: this.transformedImage.src,
        position: this.position,
        width: this.transformedImage.width,
        height: this.transformedImage.height
      })
    }
  }
</script>

<style scoped lang="scss">

</style>
