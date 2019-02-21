<template>
  <div class="w-full h-full bg-grey-lighter">
    <div v-show="isLoading" class="w-full h-64 flex justify-center items-center">
      <BiggerLoader></BiggerLoader>
    </div>
    <div v-show="isReady" class="w-full h-full">
      <div ref="stageWrapper" class="stageWrapper relative" id="stageWrapper">
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
        currentStatus: STATUS_LOADING
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

      async addBackgroundImage () {
        try {
          const src = (this.smallBackground ? this.canvasSettings.urlSmall : this.canvasSettings.url) + '?date=' + Math.round(Date.now())

          const windowImage = await this.createWindowImage(src)
          const imageData = {
            position: { x: 0, y: 0 },
            width: this.canvasSettings.width,
            height: this.canvasSettings.height,
            renderPosition: { x: 0, y: 0 },
            windowImage: windowImage
          }
          this.renderQueue.background.push(imageData)
          this.$emit('load')
        } catch (e) {
          console.error(e)
          this.$emit('error')
        }
      },

      async updateBackgroundImage() {
        this.renderQueue.background = []
        this.currentStatus = STATUS_LOADING
        await this.addBackgroundImage()
        this.currentStatus = STATUS_READY
      },

      async addOverlayImage (imageObject) {
        imageObject.windowImage = await this.createWindowImage(imageObject.src)
        imageObject.renderPosition = { x: 0, y: 0 }
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

      runRenderQueue () {
        if (this.renderBackground) {
          this.clearContext(this.backgroundContext)

          this.renderQueue.background.map(imageObject => {
            this.renderImage(this.backgroundContext, imageObject)
          })
          this.renderBackground = false
        }

        if (this.renderOverlay) {
          this.clearContext(this.overlayContext)

          this.renderQueue.overlay.map(imageObject => {
            this.renderImage(this.overlayContext, imageObject)
          })
          this.renderOverlay = false
        }

        requestAnimationFrame(this.runRenderQueue)
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

        const containerWidth = this.$refs.backgroundCanvas.width

        const smallerThanContainerScale = 0.95
        const scale = (containerWidth / this.canvasSettings.width) * smallerThanContainerScale

        this.setScale(scale)
        const smallerThanContainerBorder = (containerWidth - (containerWidth * smallerThanContainerScale)) / 2

        this.setCanvasPosition({ x: smallerThanContainerBorder, y: smallerThanContainerBorder })

      },

      _getFirstOverlayPosition () {

        if (this.renderQueue.overlay.length === 0) throw Error('No overlay found')

        return {
          x: this.position.overlay.x + this.renderQueue.overlay[0].position.x,
          y: this.position.overlay.y + this.renderQueue.overlay[0].position.y,
        }
      },

      getScaledOverlayPosition()  {
        const overlayPos = this._getFirstOverlayPosition()
        return {
          x: overlayPos.x / this.scale,
          y: overlayPos.y / this.scale
        }
      },

      updateOverlayPosition ({ x, y }) {
        if (x === 0 && y === 0) return

        const overlayPos = this._getFirstOverlayPosition()

        // LIMIT TOP & LEFT
        if (overlayPos.x + x < this.position.background.x && x < 0) x = -1 * (overlayPos.x - this.position.background.x)
        if (overlayPos.y + y < this.position.background.y && y < 0) y = -1 * (overlayPos.y - this.position.background.y)

        // LIMIT BOTTOM & RIGHT
        if (overlayPos.x + this.renderQueue.overlay[0].width * this.scale + x > this.position.background.x + config.canvas.width * this.scale && x > 0)
          x = this.position.background.x + config.canvas.width * this.scale - overlayPos.x - this.renderQueue.overlay[0].width * this.scale

        if (overlayPos.y + this.renderQueue.overlay[0].height * this.scale + y > this.position.background.y + config.canvas.height * this.scale && y > 0)
          y = this.position.background.y + config.canvas.height * this.scale - overlayPos.y - this.renderQueue.overlay[0].height * this.scale

        if (x === 0 && y === 0) return

        this.position.overlay.x += x
        this.position.overlay.y += y

        this.updateOverlayRenderPosition()
      },

      updateBackgroundPosition ({ x, y }) {
        if (x === 0 && y === 0) return {x, y}

        const maxOffset = 70

        // LEFT
        if (this.position.background.x + x + config.canvas.width * this.scale < maxOffset) x = 0

        // TOP
        if (this.position.background.y + y + config.canvas.height * this.scale < maxOffset) y = 0

        // RIGHT
        if (this.position.background.x + x > this.$refs.backgroundCanvas.clientWidth - maxOffset) x = 0

        // BOTTOM
        if (this.position.background.y + y > this.$refs.backgroundCanvas.clientHeight - maxOffset) y = 0

        if (x === 0 && y === 0) return {x, y}

        this.position.background.x += x
        this.position.background.y += y

        this.updateBackgroundRenderPosition()
        return { x, y }
      },

      updateCanavsPosition ({ x, y }) {

        // AVOID MORE UPDATES WHEN WE ARE RUNNING OUT OF BOUND
        let { x:newX, y:newY } = this.updateBackgroundPosition({ x, y })
        this.updateBackgroundRenderPosition()

        this.updateOverlayPosition({ x:newX, y:newY })
        this.updateBackgroundRenderPosition()
      },

      setOverlayPosition ({ x, y }) {
        this.position.overlay.x = x
        this.position.overlay.y = y

        this.updateOverlayRenderPosition()
      },

      setCanvasPosition ({ x, y }) {
        this.position.background.x = x
        this.position.background.y = y

        this.setOverlayPosition({ x, y })
        this.updateBackgroundRenderPosition()
      },

      updateOverlayRenderPosition () {
        this.renderQueue.overlay.map(imageObject => {
          imageObject.renderPosition = {
            x: imageObject.position.x / this.scale + this.position.overlay.x / this.scale,
            y: imageObject.position.y / this.scale + this.position.overlay.y / this.scale
          }
        })
        this.renderOverlay = true
      },

      updateBackgroundRenderPosition () {
        this.renderQueue.background.map(imageObject => {
          imageObject.renderPosition = {
            x: imageObject.position.x / this.scale + this.position.background.x / this.scale,
            y: imageObject.position.y / this.scale + this.position.background.y / this.scale
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

      isUserClickingOnOverlay (event) {

        // IS THERE EVEN AN OVERLAY?
        if (this.renderQueue.overlay.length === 0) return false

        const overlay = this.renderQueue.overlay[0]

        const currentClick = {
          x: event.clientX - this.$refs.stageWrapper.offsetLeft,
          y: event.clientY - this.$refs.stageWrapper.offsetTop
        }

        const localCoords = {
          x: currentClick.x / this.scale - (this.position.overlay.x + overlay.position.x) / this.scale,
          y: currentClick.y / this.scale - (this.position.overlay.y + overlay.position.y) / this.scale,
        }

        return localCoords.x > 0
          && localCoords.y > 0
          && localCoords.x < overlay.width
          && localCoords.y < overlay.height
      },

      onMoveEvent (event) {
        let offsetTop = this.$refs.stageWrapper.offsetTop
        let offsetLeft = this.$refs.stageWrapper.offsetLeft

        // SET CURSOR POS
        this.currentCursor = {
          x: event.clientX,
          y: event.clientY
        }

        // CHECK IF OLD POS IS NOT DEFAULT
        if (this.lastPos.x !== -1 && this.lastPos.y !== -1) {
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
            else if (this.moveTarget === 'overlay') {
              this.updateOverlayPosition(diff)
            }

            this.lastPos = {
              x: event.clientX - offsetLeft,
              y: event.clientY - offsetTop
            }
          }
        }
      },

      onScaleEvent (scaleCenter, newScale) {

        // SET SCALE CENTER RELATIVE TO CANVAS POSITION
        scaleCenter = {
          x: scaleCenter.x - this.$refs.stageWrapper.offsetLeft,
          y: scaleCenter.y - this.$refs.stageWrapper.offsetTop
        }

        const oldScale = this.scale

        const mousePointTo = {
          x: scaleCenter.x / oldScale - this.position.background.x / oldScale,
          y: scaleCenter.y / oldScale - this.position.background.y / oldScale,
        }

        newScale = this.setScale(newScale)

        const newPos = {
          x: -(mousePointTo.x - scaleCenter.x / newScale) * newScale,
          y: -(mousePointTo.y - scaleCenter.y / newScale) * newScale
        }

        const updatePosition = {
          x: newPos.x - this.position.background.x,
          y: newPos.y - this.position.background.y
        }

        this.updateBackgroundPosition(updatePosition)

        if (this.renderQueue.overlay[0]) {
          const mouseRelativeToOverlay = {
            x: scaleCenter.x / oldScale - (this.position.overlay.x + this.renderQueue.overlay[0].position.x) / oldScale,
            y: scaleCenter.y / oldScale - (this.position.overlay.y + this.renderQueue.overlay[0].position.y) / oldScale,
          }

          const newOverlayPos = {
            x: -(mouseRelativeToOverlay.x - scaleCenter.x / newScale) * newScale,
            y: -(mouseRelativeToOverlay.y - scaleCenter.y / newScale) * newScale
          }

          const updateToOverlayPosition = {
            x: newOverlayPos.x - (this.position.overlay.x + this.renderQueue.overlay[0].position.x),
            y: newOverlayPos.y - (this.position.overlay.y + this.renderQueue.overlay[0].position.y)
          }

          this.updateOverlayPosition(updateToOverlayPosition)
        }

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
            x: touch1.clientX - this.$refs.stageWrapper.offsetLeft,
            y: touch1.clientY - this.$refs.stageWrapper.offsetTop
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

        if (this.isUserClickingOnOverlay(touch1)) {
          this.moveTarget = 'overlay'
        } else {
          this.moveTarget = 'stage'
        }
      },
      onWheelEvent (event) {
        event.preventDefault()

        const scaleBy = 1.1

        const cursorPosOnStart = {
          x: this.currentCursor.x,
          y: this.currentCursor.y
        }

        const newScale = event.deltaY > 0 ? this.scale * scaleBy : this.scale / scaleBy

        this.onScaleEvent(cursorPosOnStart, newScale)

      },
      onMouseDownEvent (event) {

        this.lastPos = {
          x: event.clientX - this.$refs.stageWrapper.offsetLeft,
          y: event.clientY - this.$refs.stageWrapper.offsetTop
        }

        console.log(this.isUserClickingOnOverlay(event))

        // CHECK IF USER IS CLICKING ON OVERLAY
        if (this.isUserClickingOnOverlay(event)) {
          this.moveTarget = 'overlay'
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
