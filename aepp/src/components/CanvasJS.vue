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
        overlayImageId: null,
        lastDist: 0,
        lastPos: {
          x: -1,
          y: -1
        }
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
      },

      // DRAG, ZOOM AND NAVIGATIONAL STUFF

      getDistance (p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
      },
      onTouchMoveEvent (evt) {
        let stage = this.stage;
        let touch1 = evt.touches[0]
        let touch2 = evt.touches[1]

        if (touch1 && touch2) {
          let dist = this.getDistance({
            x: touch1.clientX,
            y: touch1.clientY
          }, {
            x: touch2.clientX,
            y: touch2.clientY
          })

          if (!this.lastDist) {
            this.lastDist = dist
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

          let scale = stage.getScaleX() * dist / this.lastDist

          stage.scaleX(scale)
          stage.scaleY(scale)

          let newPos = {
            x: -(mousePointTo.x - center.x / scale) * scale,
            y: -(mousePointTo.y - center.y / scale) * scale
          }

          stage.position(newPos)

          stage.draw()
          this.lastDist = dist

        } else if (touch1) {
          let offsetTop = this.$refs.stageWrapper.offsetTop
          let offsetLeft = this.$refs.stageWrapper.offsetLeft

          // GET OLD POS
          let { x, y } = this.lastPos

          // CHECK IF OLD POS IS NOT DEFAULT
          if (x !== -1 && y !== -1) {
            // CHECK IF FINGER MOVED
            let dist = this.getDistance({
              x: touch1.clientX - offsetLeft,
              y: touch1.clientY - offsetTop
            }, this.lastPos)

            if (dist > 0) {

              // MOVE CANVAS
              let diff = {
                xDiff: touch1.clientX - offsetLeft - this.lastPos.x,
                yDiff: touch1.clientY - offsetTop - this.lastPos.y,
              }

              this.moveCanvas(diff)

              this.lastPos = {
                x: touch1.clientX - offsetLeft,
                y: touch1.clientY - offsetTop
              }
            }
          }
        }
      },
      onTouchEndEvent() {
        this.lastDist = 0;
        this.lastPos = {
          x: -1,
          y: -1
        }
      },
      onTouchStartEvent(event) {
        let touch1 = event.touches[0]

        if (event.touches.length === 1) {
          this.lastPos = {
            x: touch1.clientX - this.$refs.stageWrapper.offsetLeft,
            y: touch1.clientY - this.$refs.stageWrapper.offsetTop
          }
        }
      },
      onWheelEvent(event) {
        let scaleBy = 1.2
        event.preventDefault()
        let oldScale = this.stage.scaleX()

        let mousePointTo = {
          x: this.stage.getPointerPosition().x / oldScale - this.stage.x() / oldScale,
          y: this.stage.getPointerPosition().y / oldScale - this.stage.y() / oldScale,
        }

        let newScale = event.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy
        console.log(newScale)
        //this.stage.scale({ x: newScale, y: newScale })
        this.stage.scaleX(newScale)
        this.stage.scaleY(newScale)

        let newPos = {
          x: -(mousePointTo.x - this.stage.getPointerPosition().x / newScale) * newScale,
          y: -(mousePointTo.y - this.stage.getPointerPosition().y / newScale) * newScale
        }
        this.stage.position(newPos)
        this.stage.draw()
      },
      onMouseDownEvent(event) {
        this.lastPos = {
          x: event.clientX - this.$refs.stageWrapper.offsetLeft,
          y: event.clientY - this.$refs.stageWrapper.offsetTop
        }
      },
      onMouseUpEvent() {
        this.lastPos = {
          x: -1,
          y: -1
        }
      },
      onMouseMoveEvent(event) {
        let offsetTop = this.$refs.stageWrapper.offsetTop
        let offsetLeft = this.$refs.stageWrapper.offsetLeft

        // GET OLD POS
        let { x, y } = this.lastPos

        // CHECK IF OLD POS IS NOT DEFAULT
        if (x !== -1 && y !== -1) {
          // CHECK IF FINGER MOVED


          // MOVE CANVAS
          let diff = {
            xDiff: event.clientX - offsetLeft - this.lastPos.x,
            yDiff: event.clientY - offsetTop - this.lastPos.y,
          }

          this.moveCanvas(diff)

          this.lastPos = {
            x: event.clientX - offsetLeft,
            y: event.clientY - offsetTop
          }

        }
      },
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
        /*
        MOBILE DRAG AND ZOOM HANDLER
         */

        this.stage.getContent().addEventListener('touchstart', this.onTouchStartEvent, false);
        this.stage.getContent().addEventListener('touchmove', this.onTouchMoveEvent, false)
        this.stage.getContent().addEventListener('touchend', this.onTouchEndEvent, false)

        /*
        DESKTOP DRAG AND ZOOM HANDLER
         */

        this.stage.getContent().addEventListener('wheel', this.onWheelEvent);
        this.stage.getContent().addEventListener('mousedown', this.onMouseDownEvent);
        this.stage.getContent().addEventListener('mousemove', this.onMouseMoveEvent);
        this.stage.getContent().addEventListener('mouseup', this.onMouseUpEvent);
        this.stage.getContent().addEventListener('mouseleave', this.onMouseUpEvent);
      }

      console.log('canvas mounted')
    },
    beforeDestroy: function () {
      this.stage.getContent().removeEventListener('touchstart', this.onTouchStartEvent, false);
      this.stage.getContent().removeEventListener('touchmove', this.onTouchMoveEvent, false)
      this.stage.getContent().removeEventListener('touchend', this.onTouchEndEvent, false)
      this.stage.getContent().removeEventListener('wheel', this.onWheelEvent)
      this.stage.getContent().removeEventListener('mousedown', this.onMouseDownEvent);
      this.stage.getContent().removeEventListener('mousemove', this.onMouseMoveEvent);
      this.stage.getContent().removeEventListener('mouseup', this.onMouseUpEvent);
      this.stage.getContent().removeEventListener('mouseleave', this.onMouseUpEvent);
    },
  }
</script>

<style scoped>
  .stageWrapper {
    width: 100%;
  }
</style>
