<template>
  <div ref="stageWrapper" class="stageWrapper" id="stageWrapper">
  </div>
</template>

<script>

  import Konva from 'konva'

  export default {
    name: 'CanvasJS',
    components: {},
    props: ['draggable'],
    data () {
      return {
        stage: null,
        layer: null,
        overlayLayer: null,
        windowImages: [],
        overlayImageId: null
      }
    },
    computed: {
      images () {
        return this.$store.state.images
      }
    },
    methods: {
      addOverlayImage (imageObject) {

        // CREATE NEW LAYER
        this.overlayLayer = new Konva.Layer()
        this.stage.add(this.overlayLayer)

        // ADD OBJECT ID & LAYER
        imageObject.ref = 'overlayImage'
        imageObject.layer = this.overlayLayer

        // RENDER IMAGE TO CANVAS
        this.createImage(imageObject)

        // SAVE INFO
        this.overlayImageId = 'overlayImage'

      },

      moveOverlayImage ({ xDiff, yDiff }) {

        // GET CURRENT POS
        const oI = this.stage.find(`#${this.overlayImageId}`)[0]
        const { x, y } = oI.position()

        // UPDATE POS
        oI.position({ x: x - xDiff, y: y - yDiff })

        // RERENDER THE OVERLAY LAYER
        this.overlayLayer.draw()

      },

      getOverlayPosition () {
        // GET CURRENT POS
        const oI = this.stage.find(`#${this.overlayImageId}`)[0]
        return oI.position()
      },

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
          height: imageObject.size.height,
          width: imageObject.size.width,
          id: imageObject.ref ? imageObject.ref : ''
        })
        if (imageObject.layer) {
          imageObject.layer.add(i)
          imageObject.layer.draw()
        } else {
          this.layer.add(i)
          this.layer.draw()
        }
      },
      moveCanvas ({ xDiff, yDiff }) {
        const { x, y } = this.stage.getPosition()
        this.stage.position({ x: x + xDiff, y: y + yDiff })
        this.stage.batchDraw()
        return this.stage.getPosition()
      },
      getCanvasDimensions () {
        return {
          width: this.stage.width(),
          height: this.stage.height()
        }
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
        draggable: this.draggable
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
