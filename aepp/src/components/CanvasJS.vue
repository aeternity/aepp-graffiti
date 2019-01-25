<template>
  <div ref="stageWrapper" class="stageWrapper" id="stageWrapper">
  </div>
</template>

<script>

  import Konva from 'konva';

  export default {
    name: 'CanvasJS',
    components: {},
    props: ['draggable', 'moveCallback', 'height', 'greyedOut', 'fillScale'],
    data() {
      return {
        stage: null,
        layer: null,
        overlayLayer: null,
        windowImages: [],
        overlayImageId: 'overlayImageId',
        lastDist: 0,
        lastPos: {
          x: -1,
          y: -1
        },
        moveTarget: null
      }
    },
    computed: {
      canvasSettings() {
        return this.$store.state.canvas;
      }
    },
    methods: {
      addGreyedOut() {
        const layer = new Konva.Layer();
        const rect = new Konva.Rect({
          x: 0,
          y: 0,
          width: this.canvasSettings.width,
          height: this.canvasSettings.height,
          opacity: 0.7,
          fill: '#ffffff'
        });
        layer.add(rect);
        this.stage.add(layer)
      },

      addOverlayImage(imageObject) {

        // CREATE NEW LAYER
        this.overlayLayer = new Konva.Layer()
        this.stage.add(this.overlayLayer)

        // ADD OBJECT ID & LAYER
        imageObject.ref = this.overlayImageId
        imageObject.layer = this.overlayLayer

        // RENDER IMAGE TO CANVAS
        this.createImage(imageObject)
      },

      moveOverlayImage({xDiff, yDiff}) {
        // GET CURRENT POS
        const oI = this.stage.find(`#${this.overlayImageId}`)[0]
        const {x, y} = oI.position()

        let currDimensions = {x: oI.width(), y: oI.height()}

        // LIMIT TOP & LEFT
        if (x + xDiff < 0 && xDiff < 0) xDiff = -1 * x
        if (y + yDiff < 0 && yDiff < 0) yDiff = -1 * y

        // LIMIT BOTTOM & RIGHT
        if (x + currDimensions.x + xDiff > this.canvasSettings.width && xDiff > 0) xDiff = -1 * x - currDimensions.x + this.canvasSettings.width
        if (y + currDimensions.y + yDiff > this.canvasSettings.height && yDiff > 0) yDiff = -1 * y - currDimensions.y + this.canvasSettings.height

        // UPDATE POS
        const newPos = {x: x + xDiff, y: y + yDiff}
        oI.position(newPos)
        this.$emit('positionUpdate', newPos)

        // RERENDER THE OVERLAY LAYER
        this.overlayLayer.draw()
      },

      removeOverlayImage() {
        const oI = this.stage.find(`#${this.overlayImageId}`)[0]
        oI.clearCache()
        oI.destroy()
        this.overlayLayer.draw()
      },

      updateOverlayImageSource({src, width, height}) {
        const oI = this.stage.find(`#${this.overlayImageId}`)[0]
        // let windowImage = new Image()
        let windowImage = document.createElement('img')

        windowImage.onload = () => {

          try {
            oI.clearCache()
            oI.image(windowImage)
            oI.width(width)
            oI.height(height)
            oI.cache()
            this.overlayLayer.draw()
          } catch (e) {
            console.error(e)
          }

        }

        windowImage.onerror = (e) => {
          console.error(e)
        }

        windowImage.src = src
      },

      getOverlayPosition() {
        // GET CURRENT POS
        const oI = this.stage.find(`#${this.overlayImageId}`)[0]
        return oI.position()
      },

      createImage(imageObject) {
        let windowImage = new Image()

        windowImage.onload = () => {
          this.renderImage(windowImage, imageObject)
        }

        windowImage.onerror = (e) => {
          console.error(e)
        }

        windowImage.src = imageObject.src
      },

      renderImage(windowImage, imageObject) {

        let i = new Konva.Image({
          x: imageObject.position.x,
          y: imageObject.position.y,
          image: windowImage,
          height: imageObject.height,
          width: imageObject.width,
          id: imageObject.ref ? imageObject.ref : ''
        })

        if (imageObject.layer) {
          imageObject.layer.add(i)
          imageObject.layer.draw()
          i.cache()
        } else {
          this.layer.add(i)
          this.layer.draw()
        }
      },
      moveCanvas({xDiff, yDiff}) {
        const {x, y} = this.stage.getPosition()
        this.stage.position({x: x + xDiff, y: y + yDiff})
        this.stage.batchDraw()
      },
      getStageDimensions() {
        return {
          width: this.stage.width(),
          height: this.stage.height()
        }
      },

      checkAndSetFillScale() {
        const container = document.querySelector('#stageWrapper');
        const containerWidth = container.offsetWidth;
        const smallerThanContainerScale = 0.95;
        const scale = (containerWidth / this.canvasSettings.width) * smallerThanContainerScale;
        this.checkAndSetScale(scale);

        const smallerThanContainerBorder = (containerWidth - (containerWidth * smallerThanContainerScale)) / 2;
        let newPos = {
          x: smallerThanContainerBorder,
          y: smallerThanContainerBorder,
        };
        this.stage.position(newPos)
      },

      checkAndSetScale(newScale) {
        if (newScale > 20) newScale = 20
        if (newScale < 0.08) newScale = 0.08
        this.stage.scaleX(newScale)
        this.stage.scaleY(newScale)
        return newScale
      },

      setStageScale(newScale) {

        const oldScale = this.stage.scaleX()

        let mousePointTo = {
          x: this.stage.x() / oldScale - this.stage.width() / oldScale / 2,
          y: this.stage.y() / oldScale - this.stage.height() / oldScale / 2,
        }

        newScale = this.checkAndSetScale(newScale)

        let newPos = {
          x: (mousePointTo.x + this.stage.width() / 2 / newScale) * newScale,
          y: (mousePointTo.y + this.stage.height() / 2 / newScale) * newScale
        }

        this.stage.position(newPos)
        this.stage.batchDraw()
      },

      // DRAG, ZOOM AND NAVIGATIONAL STUFF

      getDistance(p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
      },
      onTouchMoveEvent(konvaEvent) {
        const event = konvaEvent.evt;
        let stage = this.stage;
        let touch1 = event.touches[0]
        let touch2 = event.touches[1]

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

          scale = this.checkAndSetScale(scale)

          const newPos = {
            x: -(mousePointTo.x - center.x / scale) * scale,
            y: -(mousePointTo.y - center.y / scale) * scale
          }

          stage.position(newPos)
          stage.batchDraw()
          this.lastDist = dist

        } else if (touch1) {
          let offsetTop = this.$refs.stageWrapper.offsetTop
          let offsetLeft = this.$refs.stageWrapper.offsetLeft

          // GET OLD POS
          let {x, y} = this.lastPos

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

              if (this.moveTarget === 'stage') this.moveCanvas(diff);
              else if (this.moveTarget === 'overlay') {
                const newDiff = {
                  xDiff: diff.xDiff / this.stage.scaleX(),
                  yDiff: diff.yDiff / this.stage.scaleX()
                };
                this.moveOverlayImage(newDiff);
              }

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
        this.moveTarget = null;
      },
      onTouchStartEvent(konvaEvent) {
        const event = konvaEvent.evt;
        let touch1 = event.touches[0]

        if (event.touches.length === 1) {
          this.lastPos = {
            x: touch1.clientX - this.$refs.stageWrapper.offsetLeft,
            y: touch1.clientY - this.$refs.stageWrapper.offsetTop
          }
        }

        if (konvaEvent.target === this.stage || konvaEvent.target.attrs.id === "") {
          this.moveTarget = 'stage'
        } else {
          this.moveTarget = 'overlay'
        }
        return
      },
      onWheelEvent(konvaEvent) {
        const event = konvaEvent.evt

        let scaleBy = 1.2

        event.preventDefault()

        let oldScale = this.stage.scaleX()

        let mousePointTo = {
          x: this.stage.getPointerPosition().x / oldScale - this.stage.x() / oldScale,
          y: this.stage.getPointerPosition().y / oldScale - this.stage.y() / oldScale,
        }

        let newScale = event.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy

        //this.stage.scale({ x: newScale, y: newScale })
        newScale = this.checkAndSetScale(newScale)

        let newPos = {
          x: -(mousePointTo.x - this.stage.getPointerPosition().x / newScale) * newScale,
          y: -(mousePointTo.y - this.stage.getPointerPosition().y / newScale) * newScale
        }

        this.stage.position(newPos)
        this.stage.batchDraw()
      },
      onMouseDownEvent(konvaEvent) {
        const event = konvaEvent.evt;
        this.lastPos = {
          x: event.clientX - this.$refs.stageWrapper.offsetLeft,
          y: event.clientY - this.$refs.stageWrapper.offsetTop
        }
        if (konvaEvent.target === this.stage || konvaEvent.target.attrs.id === "") {
          this.moveTarget = 'stage'
        } else {
          this.moveTarget = 'overlay'
        }
      },
      onMouseUpEvent() {
        this.lastPos = {
          x: -1,
          y: -1
        }
        this.moveTarget = null
      },
      onMouseMoveEvent(konvaEvent) {
        const event = konvaEvent.evt;
        let offsetTop = this.$refs.stageWrapper.offsetTop
        let offsetLeft = this.$refs.stageWrapper.offsetLeft

        // GET OLD POS
        let {x, y} = this.lastPos
        // CHECK IF OLD POS IS NOT DEFAULT
        if (x !== -1 && y !== -1) {

          // MOVE CANVAS
          let diff = {
            xDiff: event.clientX - offsetLeft - this.lastPos.x,
            yDiff: event.clientY - offsetTop - this.lastPos.y,
          }

          if (this.moveTarget === 'stage') this.moveCanvas(diff);
          else if (this.moveTarget === 'overlay') {
            const newDiff = {
              xDiff: diff.xDiff / this.stage.scaleX(),
              yDiff: diff.yDiff / this.stage.scaleX()
            };
            this.moveOverlayImage(newDiff);
          }

          this.lastPos = {
            x: event.clientX - offsetLeft,
            y: event.clientY - offsetTop
          }

        }
      },
    },
    mounted() {
      // SET STAGE WIDTH
      const width = this.$refs.stageWrapper.clientWidth
      const height = Number(this.height) ? Number(this.height) : 300
      this.stage = new Konva.Stage({
        container: 'stageWrapper',
        width: width,
        height: height,
        draggable: false
      })

      this.layer = new Konva.Layer()
      this.stage.add(this.layer)

      // ADD BACKGROUND
      this.createImage({
        src: this.canvasSettings.url,
        position: {x: 0, y: 0},
        width: this.canvasSettings.width,
        height: this.canvasSettings.height
      });

      if (this.greyedOut) this.addGreyedOut();
      if (this.fillScale) this.checkAndSetFillScale();

      if (this.draggable) {
        /*
        MOBILE DRAG AND ZOOM HANDLER
         */

        this.stage.on('touchstart', this.onTouchStartEvent);
        this.stage.on('touchmove', this.onTouchMoveEvent)
        this.stage.on('touchend', this.onTouchEndEvent)

        /*
        DESKTOP DRAG AND ZOOM HANDLER
         */

        this.stage.on('wheel', this.onWheelEvent);
        this.stage.on('mousedown', this.onMouseDownEvent);
        this.stage.on('mousemove', this.onMouseMoveEvent);
        this.stage.on('mouseup', this.onMouseUpEvent);
        this.stage.getContent().addEventListener('mouseleave', this.onMouseUpEvent);
      }

      console.log('canvas mounted')
    },
    beforeDestroy: function () {
      this.stage.off('touchstart', this.onTouchStartEvent, false);
      this.stage.off('touchmove', this.onTouchMoveEvent, false)
      this.stage.off('touchend', this.onTouchEndEvent, false)
      this.stage.off('wheel', this.onWheelEvent)
      this.stage.off('mousedown', this.onMouseDownEvent);
      this.stage.off('mousemove', this.onMouseMoveEvent);
      this.stage.off('mouseup', this.onMouseUpEvent);
      this.stage.getContent().removeEventListener('mouseleave', this.onMouseUpEvent);
    },
  }
</script>

<style scoped>
  .stageWrapper {
    width: 100%;
  }
</style>
