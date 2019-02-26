<template>
  <div class="w-full h-full" ref="canvasContainer">
    <div class="w-full h-full">
      <div ref="stageWrapper" class="stageWrapper relative" id="stageWrapper">
        <BiggerLoader v-show="isLoading" class="absolute pin"></BiggerLoader>
        <canvas id="backgroundCanvas" ref="backgroundCanvas" class="absolute pin"></canvas>
        <canvas id="overlayCanvas" ref="overlayCanvas" class="absolute pin"></canvas>
      </div>
    </div>
  </div>
</template>


<script>

  import BiggerLoader from '~/components/BiggerLoader'
  import config from '~/config'

  const STATUS_LOADING = 1, STATUS_READY = 2

  export default {
    name: 'NativeCanvas',
    components: { BiggerLoader },
    props: ['draggable', 'height', 'greyedOut', 'fillScale', 'smallBackground'],
    data () {
      return {
        backgroundContext: null,
        overlayContext: null,
        lastDist: 0,
        scale: 1,
        renderBackground: true,
        renderOverlay: true,
        lastPos: {
          x: -1,
          y: -1
        },
        position: {
          background: { x: 0, y: 0 },
          overlay: { x: 0, y: 0 }
        },
        renderQueue: {
          background: [],
          overlay: []
        },
        currentCursor: {
          x: -1,
          y: -1
        },
        moveTarget: null,
        currentStatus: STATUS_LOADING,
        shards: {
          horizontal: 1,
          vertical: 1,
          svg: false
        },
        backgroundUrl: config.canvas.urlSmall,
        cacheTimestamp: Date.now()
      }
    },
    computed: {
      canvasSettings () {
        return config.canvas
      },
      isLoading () {
        return this.currentStatus === STATUS_LOADING
      },
      isReady () {
        return this.currentStatus === STATUS_READY
      }
    },
    methods: {

      async createWindowImage (src) {
        return new Promise((resolve, reject) => {
          let windowImage = new Image()

          windowImage.onload = () => {
            resolve(windowImage)
          }

          windowImage.onerror = (e) => {
            console.error(e)
            reject(e)
          }

          windowImage.src = src
        })
      },

      renderImage (context, imageObject) {
        context.drawImage(imageObject.windowImage, imageObject.renderPosition.x, imageObject.renderPosition.y, imageObject.width, imageObject.height)
      },

      async updateBackgroundOnZoom () {
        let foundUpdate = false
        if (this.scale > 5) {
          if(this.shards.horizontal === 4) return
          console.log("updating to 4x4")
          this.shards = {
            horizontal: 4,
            vertical: 4
          }
          foundUpdate = true
        } else if (this.scale > 3) {
          if(this.shards.horizontal === 3) return
          console.log("updating to 3x3")
          this.shards = {
            horizontal: 3,
            vertical: 3
          }
          foundUpdate = true
        } else if (this.scale > 1) {
          if(this.shards.horizontal === 2) return
          console.log("updating to 2x2")
          this.shards = {
            horizontal: 2,
            vertical: 2
          }
          foundUpdate = true
        } else if(this.scale <= 1) {
          if(this.shards.horizontal === 1) return
          console.log("updating to 1x1")
          this.shards  = {
            horizontal: 1,
            vertical: 1
          }
          foundUpdate = true
        }
        if(foundUpdate) {
          await this.addBackgroundImage ()
          this.renderBackground = true
        }
      },

      async addBackgroundImage () {
        try {

          let xOffset = 0, yOffset = 0
          if(this.renderQueue.background.length > 0) {
            // RETRIEVE POSITION AND SET NEW BACKGROUND ACCORDINGLY
            xOffset = this.renderQueue.background[0].position.x
            yOffset = this.renderQueue.background[0].position.y
            console.log(xOffset, yOffset)
          }

          this.renderQueue.background = []

          const shardWidth = this.canvasSettings.width / this.shards.horizontal
          const shardHeight = this.canvasSettings.height / this.shards.vertical

          for (let i = 0; i < this.shards.horizontal * this.shards.vertical; i++) {

            const horizontalIndex = i % this.shards.horizontal;
            const verticalIndex = Math.floor(i / this.shards.vertical);

            let src = this.canvasSettings.shardURL + `${this.shards.horizontal}${this.shards.vertical}_${horizontalIndex}_${verticalIndex}.png`

            if(this.shards.horizontal === 1 && this.shards.vertical === 1) {
              src = this.shards.svg ? this.canvasSettings.url : this.canvasSettings.urlSmall
            }

            const windowImage = await this.createWindowImage(src)
            const imageData = {
              position: {
                x: (shardWidth * horizontalIndex) * this.scale + xOffset,
                y: (shardHeight * verticalIndex) * this.scale + yOffset
              },
              width: shardWidth,
              height: shardHeight,
              renderPosition: { x: 0, y: 0 },
              windowImage: windowImage
            }
            this.renderQueue.background.push(imageData)
          }
          this.updateBackgroundRenderPosition()
          this.renderBackground = true
          console.log(this.scale, this.renderQueue.background.length)

        } catch (e) {
          console.error(e)
          this.$emit('error')
        }
      },

      async updateBackgroundImage () {
        this.renderQueue.background = []
        this.currentStatus = STATUS_LOADING
        await this.addBackgroundImage()
        this.currentStatus = STATUS_READY
      },

      async addOverlayImage (imageObject) {
        imageObject.windowImage = await this.createWindowImage(imageObject.src)
        imageObject.renderPosition = { x: 0, y: 0 }
        imageObject.position = {
          x: imageObject.position.x * this.scale,
          y: imageObject.position.y * this.scale
        }
        this.renderQueue.overlay.push(imageObject)
        this.updateOverlayRenderPosition()
      },

      async updateOverlayImage (imageObject) {
        if (this.renderQueue.overlay.length === 0) throw Error('No overlay image found in render queue')
        // CHANGE IMAGE
        this.renderQueue.overlay[0].windowImage = await this.createWindowImage(imageObject.src)
        this.renderQueue.overlay[0].width = imageObject.width
        this.renderQueue.overlay[0].height = imageObject.height
        // SIGNAL RENDER
        this.renderOverlay = true
      },

      isImageObjectVisible (imageObject) {
        return !(
          // IS TOO FAR BOTTOM
          this.$refs.backgroundCanvas.clientHeight < imageObject.position.y ||
          // IS TOO FAR RIGHT
          this.$refs.backgroundCanvas.clientWidth < imageObject.position.x ||
          // IS TOO FAR TOP
          0 > imageObject.position.y + imageObject.height * this.scale ||
          // IS TOO FAR LEFT
          0 > imageObject.position.x + imageObject.width * this.scale
        )
      },

      runRenderQueue () {
        if (this.renderBackground && this.renderQueue.background.length > 0) {
          this.clearContext(this.backgroundContext)

          this.renderQueue.background.map(imageObject => {
            if (this.isImageObjectVisible(imageObject)) {
              this.renderImage(this.backgroundContext, imageObject)
            }
          })
          this.renderBackground = false
        }

        if (this.renderOverlay && this.renderQueue.overlay.length > 0) {
          this.clearContext(this.overlayContext)

          this.renderQueue.overlay.map(imageObject => {
            if (this.isImageObjectVisible(imageObject)) {
              this.renderImage(this.overlayContext, imageObject)
            }
          })
          this.renderOverlay = false
        }

        window.requestAnimationFrame(this.runRenderQueue)
      },

      clearContext (context) {
        context.save()
        context.setTransform(1, 0, 0, 1, 0, 0)
        context.clearRect(0, 0, this.$refs.backgroundCanvas.width, this.$refs.backgroundCanvas.height)
        context.restore()
      },

      setScale (newScale) {
        if (newScale > 20) newScale = 20
        if (newScale < 0.08) newScale = 0.08
        const scaleDiff = newScale / this.scale

        if (scaleDiff !== 0) {
          this.scale = newScale
          this.backgroundContext.scale(scaleDiff, scaleDiff)
          this.overlayContext.scale(scaleDiff, scaleDiff)
          this.updateBackgroundRenderPosition()
          this.updateOverlayRenderPosition()
        }
        return newScale

      },
      setScaleToFill () {

        const containerWidth = this.$refs.canvasContainer.clientWidth

        const smallerThanContainerScale = 0.95
        const newScale = (containerWidth / config.canvas.width) * smallerThanContainerScale

        this.onScaleEvent({
          x: this.$refs.canvasContainer.offsetLeft,
          y: this.$refs.canvasContainer.offsetTop
        }, newScale)

        const smallerThanContainerBorder = (containerWidth - (containerWidth * smallerThanContainerScale)) / 2

        const backgroundPositionUpdate = {
          x: smallerThanContainerBorder - this.renderQueue.background[0].position.x,
          y: smallerThanContainerBorder - this.renderQueue.background[0].position.y
        }

        this.updateCanavsPosition(backgroundPositionUpdate)
      },

      _getFirstOverlayPosition () {
        if (this.renderQueue.overlay.length === 0) throw Error('No overlay found')

        return {
          x: this.renderQueue.overlay[0].position.x,
          y: this.renderQueue.overlay[0].position.y,
        }
      },

      _getBackgroundBoundingRect () {
        if (this.renderQueue.background.length === 0) throw Error('No overlay found')

        const boundingRect = this.renderQueue.background.reduce((acc, imageObject) => {
          if (acc.x === null || imageObject.position.x < acc.x) acc.x = imageObject.position.x
          if (acc.y === null || imageObject.position.y < acc.y) acc.y = imageObject.position.y
          return acc
        }, { y: null, x: null })

        boundingRect.width = config.canvas.width
        boundingRect.height = config.canvas.height

        return boundingRect
      },

      getScaledOverlayPosition () {
        const overlayPos = this._getFirstOverlayPosition()
        return {
          x: overlayPos.x / this.scale,
          y: overlayPos.y / this.scale
        }
      },

      updateOverlayPosition (imageObject, { x, y }) {
        if (x === 0 && y === 0) return
        if (this.renderQueue.overlay.length === 0) return

        const overlayPos = imageObject.position
        const boundingRect = this._getBackgroundBoundingRect()

        // LIMIT TOP & LEFT
        if (overlayPos.x + x < boundingRect.x && x < 0) x = -1 * (overlayPos.x - boundingRect.x)
        if (overlayPos.y + y < boundingRect.y && y < 0) y = -1 * (overlayPos.y - boundingRect.y)

        // LIMIT BOTTOM & RIGHT
        if (overlayPos.x + imageObject.width * this.scale + x > boundingRect.x + config.canvas.width * this.scale && x > 0)
          x = boundingRect.x + boundingRect.width * this.scale - overlayPos.x - imageObject.width * this.scale

        if (overlayPos.y + imageObject.height * this.scale + y > boundingRect.y + config.canvas.height * this.scale && y > 0)
          y = boundingRect.y + boundingRect.height * this.scale - overlayPos.y - imageObject.height * this.scale

        if (x === 0 && y === 0) return

        imageObject.position.x += x
        imageObject.position.y += y

        this.updateOverlayRenderPosition()
      },

      checkIfBackgroundUpdateIsValid ({ x, y }) {
        if (x === 0 && y === 0) return { x, y }

        const maxOffset = 70

        const boundingRect = this._getBackgroundBoundingRect()

        // LEFT
        if (boundingRect.x + x + boundingRect.width * this.scale < maxOffset) x = 0

        // TOP
        if (boundingRect.y + y + boundingRect.height * this.scale < maxOffset) y = 0

        // RIGHT
        if (boundingRect.x + x > this.$refs.canvasContainer.clientWidth - maxOffset) x = 0

        // BOTTOM
        if (boundingRect.y + y > this.$refs.backgroundCanvas.clientHeight - maxOffset) y = 0

        if (x === 0 && y === 0) return { x, y }

        return { x, y }
      },

      updateBackgroundPosition (imageObject, { x, y }) {

        imageObject.position.x += x
        imageObject.position.y += y

        this.updateBackgroundRenderPosition()

      },

      updateCanavsPosition ({ x, y }) {

        // AVOID MORE UPDATES WHEN WE ARE RUNNING OUT OF BOUND

        let { x: newX, y: newY } = this.checkIfBackgroundUpdateIsValid({ x, y })
        this.renderQueue.background.map(imageObject => {
          this.updateBackgroundPosition(imageObject, { x: newX, y: newY })
        })

        this.updateBackgroundRenderPosition()

        this.renderQueue.overlay.map(imageObject => {
          this.updateOverlayPosition(imageObject, { x: newX, y: newY })
        })
        this.updateOverlayRenderPosition()

      },

      updateOverlayRenderPosition () {
        this.renderQueue.overlay.map(imageObject => {
          imageObject.renderPosition = {
            x: imageObject.position.x / this.scale,
            y: imageObject.position.y / this.scale
          }
        })
        this.renderOverlay = true
      },

      updateBackgroundRenderPosition () {
        this.renderQueue.background.map(imageObject => {
          imageObject.renderPosition = {
            x: imageObject.position.x / this.scale,
            y: imageObject.position.y / this.scale
          }
        })
        this.renderBackground = true
      },

      setBackgroundAlpha (alpha) {
        this.backgroundContext.globalAlpha = alpha
        this.renderBackground = true
      },

      // HANDLER HELPERS

      getDistance (p1, p2) {
        return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2))
      },

      isUserClickingOnOverlay (overlay, event) {
        const currentClick = {
          x: event.clientX - this.$refs.canvasContainer.offsetLeft,
          y: event.clientY - this.$refs.canvasContainer.offsetTop
        }

        const localCoords = {
          x: currentClick.x / this.scale - overlay.position.x / this.scale,
          y: currentClick.y / this.scale - overlay.position.y / this.scale,
        }

        return localCoords.x > 0
          && localCoords.y > 0
          && localCoords.x < overlay.width
          && localCoords.y < overlay.height
      },

      onMoveEvent (event) {
        // CHECK IF OLD POS IS NOT DEFAULT
        if (this.lastPos.x !== -1 && this.lastPos.y !== -1) {

          let offsetTop = this.$refs.canvasContainer.offsetTop
          let offsetLeft = this.$refs.canvasContainer.offsetLeft

          // CHECK IF FINGER MOVED
          let dist = this.getDistance({
            x: event.clientX - offsetLeft,
            y: event.clientY - offsetTop
          }, this.lastPos)

          if (dist > 0) {
            // MOVE CANVAS
            let diff = {
              x: event.clientX - offsetLeft - this.lastPos.x,
              y: event.clientY - offsetTop - this.lastPos.y,
            }
            if (this.moveTarget === 'stage') this.updateCanavsPosition(diff)
            else if (this.moveTarget) {
              this.updateOverlayPosition(this.moveTarget, diff)
            }

            this.lastPos = {
              x: event.clientX - offsetLeft,
              y: event.clientY - offsetTop
            }
          }
        }
      },

      calculatePositionUpdate (imageObject, scaleCenter, oldScale, newScale) {

        const relativeCursorPosition = {
          x: scaleCenter.x / oldScale - imageObject.position.x / oldScale,
          y: scaleCenter.y / oldScale - imageObject.position.y / oldScale
        }

        const newPos = {
          x: -(relativeCursorPosition.x - scaleCenter.x / newScale) * newScale,
          y: -(relativeCursorPosition.y - scaleCenter.y / newScale) * newScale
        }

        return {
          x: newPos.x - imageObject.position.x,
          y: newPos.y - imageObject.position.y
        }
      },

      async onScaleEvent (scaleCenter, newScale) {

        // SET SCALE CENTER RELATIVE TO CANVAS POSITION
        scaleCenter = {
          x: scaleCenter.x - this.$refs.canvasContainer.offsetLeft,
          y: scaleCenter.y - this.$refs.canvasContainer.offsetTop
        }

        const oldScale = this.scale

        newScale = this.setScale(newScale)

        this.renderQueue.background.map(imageObject => {
          let update = this.calculatePositionUpdate(imageObject, scaleCenter, oldScale, newScale)
          this.updateBackgroundPosition(imageObject, update)
        })

        this.renderQueue.overlay.map(imageObject => {
          let update = this.calculatePositionUpdate(imageObject, scaleCenter, oldScale, newScale)
          this.updateOverlayPosition(imageObject, update)
        })

        await this.updateBackgroundOnZoom()


      },

      // EVENT HANDLER METHODS FOR MOVEMENTS

      onTouchMoveEvent (event) {

        event.preventDefault()

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

          let center = {
            x: (touch1.clientX + touch2.clientX) / 2,
            y: (touch1.clientY + touch2.clientY) / 2
          }

          let newScale = this.scale * dist / this.lastDist

          this.onScaleEvent(center, newScale)
          this.lastDist = dist

        } else if (touch1) {
          this.onMoveEvent(touch1)
        }
      },
      onTouchEndEvent (event) {
        event.preventDefault()
        this.lastDist = 0
        this.lastPos = {
          x: -1,
          y: -1
        }
        this.moveTarget = null
      },
      onTouchStartEvent (event) {

        event.preventDefault()

        let touch1 = event.touches[0]

        if (event.touches.length === 1) {
          this.lastPos = {
            x: touch1.clientX - this.$refs.canvasContainer.offsetLeft,
            y: touch1.clientY - this.$refs.canvasContainer.offsetTop
          }
        } else if (event.touches.length === 2) {
          let touch2 = event.touches[1]
          this.lastDist = this.getDistance({
            x: touch1.clientX,
            y: touch1.clientY
          }, {
            x: touch2.clientX,
            y: touch2.clientY
          })
        }

        const target = this.renderQueue.overlay.find(imageObject => this.isUserClickingOnOverlay(imageObject, touch1))
        if (target) {
          this.moveTarget = target
        } else {
          this.moveTarget = 'stage'
        }
      },
      onWheelEvent (event) {
        event.preventDefault()

        const scaleBy = 1.1

        const cursorPosOnStart = {
          x: event.clientX,
          y: event.clientY
        }

        const newScale = event.deltaY > 0 ? this.scale * scaleBy : this.scale / scaleBy

        this.onScaleEvent(cursorPosOnStart, newScale)

      },
      onMouseDownEvent (event) {

        this.lastPos = {
          x: event.clientX - this.$refs.canvasContainer.offsetLeft,
          y: event.clientY - this.$refs.canvasContainer.offsetTop
        }

        // CHECK IF USER IS CLICKING ON OVERLAY
        const target = this.renderQueue.overlay.find(imageObject => this.isUserClickingOnOverlay(imageObject, event))
        if (target) {
          this.moveTarget = target
        } else {
          this.moveTarget = 'stage'
        }
      },
      onMouseUpEvent () {
        this.lastPos = {
          x: -1,
          y: -1
        }
        this.moveTarget = null
      },
      onMouseMoveEvent (event) {
        event.preventDefault()
        this.onMoveEvent(event)
      },
    }
    ,
    async mounted () {
      // SET STAGE WIDTH
      const width = window.innerWidth
      const height = Number(this.height) ? Number(this.height) : 300

      this.$refs.overlayCanvas.width = width
      this.$refs.overlayCanvas.height = height

      this.$refs.backgroundCanvas.width = width
      this.$refs.backgroundCanvas.height = height

      this.backgroundContext = this.$refs.backgroundCanvas.getContext('2d')
      this.overlayContext = this.$refs.overlayCanvas.getContext('2d')

      await this.addBackgroundImage()

      this.currentStatus = STATUS_READY

      this.runRenderQueue()

      // GREYED OUT
      // this.setBackgroundAlpha(0.2)
      if (this.greyedOut) this.setBackgroundAlpha(0.2)

      // this.setScaleToFill()
      if (this.fillScale) this.setScaleToFill()

      if (this.draggable) {
        /*
        MOBILE DRAG AND ZOOM HANDLER
         */

        this.$refs.stageWrapper.addEventListener('touchstart', this.onTouchStartEvent)
        this.$refs.stageWrapper.addEventListener('touchmove', this.onTouchMoveEvent)
        this.$refs.stageWrapper.addEventListener('touchend', this.onTouchEndEvent)

        /*
        DESKTOP DRAG AND ZOOM HANDLER
         */

        this.$refs.stageWrapper.addEventListener('wheel', this.onWheelEvent)
        this.$refs.stageWrapper.addEventListener('mousedown', this.onMouseDownEvent)
        this.$refs.stageWrapper.addEventListener('mousemove', this.onMouseMoveEvent)
        this.$refs.stageWrapper.addEventListener('mouseup', this.onMouseUpEvent)
        this.$refs.stageWrapper.addEventListener('mouseleave', this.onMouseUpEvent)
      }
    }
    ,
    beforeDestroy: function () {
      this.$refs.stageWrapper.removeEventListener('touchstart', this.onTouchStartEvent, false)
      this.$refs.stageWrapper.removeEventListener('touchmove', this.onTouchMoveEvent, false)
      this.$refs.stageWrapper.removeEventListener('touchend', this.onTouchEndEvent, false)
      this.$refs.stageWrapper.removeEventListener('wheel', this.onWheelEvent)
      this.$refs.stageWrapper.removeEventListener('mousedown', this.onMouseDownEvent)
      this.$refs.stageWrapper.removeEventListener('mousemove', this.onMouseMoveEvent)
      this.$refs.stageWrapper.removeEventListener('mouseup', this.onMouseUpEvent)
      this.$refs.stageWrapper.removeEventListener('mouseleave', this.onMouseUpEvent)
    }
    ,
  }
</script>

<style scoped>

</style>
