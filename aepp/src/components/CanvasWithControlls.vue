<template>
  <div class="w-full h-full">
    <NativeCanvas
      :fillScale="true"
      :height=height
      ref="canvas"
      :draggable=draggable
      :greyed-out=greyedOut
      :smallBackground="true"
    ></NativeCanvas>
  </div>
</template>

<script>
  import NativeCanvas from './NativeCanvas.vue'
  import config from '~/config'

  export default {
    name: 'CanvasWithControlls',
    components: { NativeCanvas },
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
      getOverlayPosition () {
        return this.$refs.canvas.getScaledOverlayPosition()
      },
      async changeOverlayScale (scaleDiff) {
        const pos = this.getOverlayPosition()
        await this.$store.dispatch('updatePosition', {
          x: pos.x,
          y: pos.y
        })
        await this.$store.dispatch('updateSettings', {
          scaleFactor: this.settings.scaleFactor + scaleDiff
        })
        this.$refs.canvas.updateOverlayImage({
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
