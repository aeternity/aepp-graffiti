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
        draggable: false
      })

      this.layer = new Konva.Layer()
      this.stage.add(this.layer)

      // SHOW IMAGES
      this.images.forEach(i => {
        this.createImage(i)
      })

      if (this.draggable) {
        let stage = this.stage
        let lastDist = 0
        let lastPos = {
          x: -1,
          y: -1
        }

        function getDistance (p1, p2) {
          return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
        }

        stage.getContent().addEventListener('touchstart', (evt) => {
          let touch1 = evt.touches[0]

          if(evt.touches.length === 1) {
            lastPos = {
              x: touch1.clientX - this.$refs.stageWrapper.offsetLeft,
              y: touch1.clientY - this.$refs.stageWrapper.offsetTop
            }
          }

        })

        stage.getContent().addEventListener('touchmove', (evt) => {
          let touch1 = evt.touches[0]
          let touch2 = evt.touches[1]

          if (touch1 && touch2) {
            let dist = getDistance({
              x: touch1.clientX,
              y: touch1.clientY
            }, {
              x: touch2.clientX,
              y: touch2.clientY
            })

            if (!lastDist) {
              lastDist = dist
            }
            let oldScale = stage.getScaleX()

            let offsetTop = this.$refs.stageWrapper.offsetTop
            let offsetLeft = this.$refs.stageWrapper.offsetLeft

            let center = {
              x: (touch1.clientX + touch2.clientX) / 2 - offsetLeft,
              y: (touch1.clientY + touch2.clientY) / 2 - offsetTop
            }

            let mousePointTo = {
              x: center.x / oldScale - stage.x() / oldScale,
              y: center.y / oldScale - stage.y() / oldScale,
            }

            let scale = stage.getScaleX() * dist / lastDist

            stage.scaleX(scale)
            stage.scaleY(scale)

            let newPos = {
              x: -(mousePointTo.x - center.x / scale) * scale,
              y: -(mousePointTo.y - center.y / scale) * scale
            }

            stage.position(newPos)

            stage.draw()
            lastDist = dist
          } else if (touch1) {
            let offsetTop = this.$refs.stageWrapper.offsetTop
            let offsetLeft = this.$refs.stageWrapper.offsetLeft

            // GET OLD POS
            let { x, y } = lastPos

            // CHECK IF OLD POS IS NOT DEFAULT
            if (x !== -1 && y !== -1) {
              // CHECK IF FINGER MOVED
              let dist = getDistance({
                x: touch1.clientX - offsetLeft,
                y: touch1.clientY - offsetTop
              }, lastPos)

              if (dist > 0) {

                // MOVE CANVAS
                let diff = {
                  xDiff: touch1.clientX - offsetLeft - lastPos.x,
                  yDiff: touch1.clientY - offsetTop - lastPos.y,
                }

                this.moveCanvas(diff)

                lastPos = {
                  x: touch1.clientX - offsetLeft,
                  y: touch1.clientY - offsetTop
                }
              }
            }
          }
        }, false)

        stage.getContent().addEventListener('touchend', function () {
          lastDist = 0
          lastPos = {
            x: -1,
            y: -1
          }
        }, false)
      }

      console.log('canvas mounted')
    }
  }
</script>

<style scoped>
  .stageWrapper {
    width: 100%;
  }
</style>
