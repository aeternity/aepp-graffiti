<template>
  <div ref="stageWrapper" class="stageWrapper" id="stageWrapper">
  </div>
</template>

<script>

  import Konva from 'konva'

  export default {
    name: 'CanvasJS',
    components: {},
    props: [],
    data () {
      return {
        configKonva: {
          width: `auto`,
          height: 200,
          draggable: true
        },
        stage: null,
        layer: null,
        windowImages: []
      }
    },
    computed: {
      images () {
        return this.$store.state.images
      }
    },
    methods: {
      createImage (imageObject) {
        let windowImage = new Image()
        windowImage.onload = () => {
          this.renderImage(windowImage, imageObject)
        }
        windowImage.src = imageObject.src
      },
      renderImage (windowImage, imageObject) {
        let i = new Konva.Image({
          x: imageObject.position.x,
          y: imageObject.position.y,
          image: windowImage,
          height: windowImage.height,
          width: windowImage.width
        })
        this.layer.add(i)
        this.layer.draw()
      },
      moveCanvas ({ xDiff, yDiff }) {
        const { x, y } = this.stage.getPosition()
        this.stage.position({ x: x + xDiff, y: y + yDiff })
        this.stage.batchDraw()
        return this.stage.getPosition();
      }
    },
    created () {
      this.$store.dispatch(`loadImages`)
    },
    mounted () {
      // SET STAGE WIDTH
      const width = this.$refs.stageWrapper.clientWidth
      this.stage = new Konva.Stage({
        container: 'stageWrapper',
        width: width,
        height: 300,
        draggable: true
      })

      this.layer = new Konva.Layer()
      this.stage.add(this.layer)

      // SHOW IMAGES
      this.images.forEach(i => {
        this.createImage(i)
      })

      console.log('canvas mounted')
    }
  }
</script>

<style scoped>
  .stageWrapper {
    width: 100%;
  }
</style>
