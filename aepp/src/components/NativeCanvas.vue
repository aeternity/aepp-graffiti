<template>
  <div class="w-full h-full" ref="canvasContainer">
    <div class="w-full h-full">
      <div ref="stageWrapper" class="stageWrapper relative" id="stageWrapper">
        <canvas id="backgroundCanvas" ref="backgroundCanvas" class="absolute inset-0" :style="{
          width: cssWidth,
          height: cssHeight
        }"></canvas>
        <canvas id="overlayCanvas" ref="overlayCanvas" class="absolute inset-0" :style="{
          width: cssWidth,
          height: cssHeight
        }"></canvas>
        <div v-show="isLoading" class="absolute inset-0 h-full w-full">
          <div class="flex justify-center items-center">
            <BiggerLoader></BiggerLoader>
          </div>
        </div>
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
        width: 0,
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
        cssToCanvasRatio: 1,
        canvasToWallRation: 1,
        moveTarget: null,
        currentStatus: STATUS_LOADING,
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
      },
      cssWidth () {
        return `${this.width}px`
      },
      cssHeight () {
        return `${this.height}px`
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

        if (this.scale > 4) {
          if (this.backgroundUrl === config.canvas.url) return
          this.backgroundUrl = config.canvas.url
          foundUpdate = true
        } else {
          if (this.backgroundUrl === config.canvas.urlSmall) return
          this.backgroundUrl = config.canvas.urlSmall
          foundUpdate = true
        }

        if (foundUpdate) {
          this.updateBackgroundImage()
        }
      },

      async addBackgroundImage () {
        try {

          let xOffset = 0, yOffset = 0

          if (this.renderQueue.background.length > 0) {
            // RETRIEVE POSITION AND SET NEW BACKGROUND ACCORDINGLY
            xOffset = this.renderQueue.background[0].position.x
            yOffset = this.renderQueue.background[0].position.y
          }

          this.renderQueue.background = []

          let src = this.backgroundUrl + `?date=${this.cacheTimestamp}`

          const windowImage = await this.createWindowImage(src)
          const imageData = {
            position: {
              x: xOffset,
              y: yOffset
            },
            width: this.canvasSettings.width,
            height: this.canvasSettings.height,
            renderPosition: { x: 0, y: 0 },
            windowImage: windowImage
          }
          this.renderQueue.background.push(imageData)

          this.updateBackgroundRenderPosition()

          this.renderBackground = true

        } catch (e) {
          console.error(e)
          this.$emit('error')
        }
      },

      async updateBackgroundImage () {
        const src = this.backgroundUrl + `?date=${this.cacheTimestamp}`
        this.renderQueue.background[0].windowImage = await this.createWindowImage(src)
        this.renderBackground = true
      },

      async reloadBackgroundImage () {
        try {
          this.cacheTimestamp = Date.now()
          await this.updateBackgroundImage()
          this.$emit('reloadSuccess')
        } catch (e) {
          console.error(e);
          this.$emit('reloadFail')
        }

      },

      async addOverlayImage (imageObject) {
        imageObject.windowImage = await this.createWindowImage(imageObject.src)
        imageObject.renderPosition = { x: 0, y: 0 }
        imageObject.width = imageObject.width * this.canvasToWallRation
        imageObject.height = imageObject.height * this.canvasToWallRation
        imageObject.position = {
          x: imageObject.position.x * this.scale * this.canvasToWallRation,
          y: imageObject.position.y * this.scale * this.canvasToWallRation
        }
        this.renderQueue.overlay.push(imageObject)
        this.updateOverlayRenderPosition()
      },

      async updateOverlayImage (imageObject) {
        if (this.renderQueue.overlay.length === 0) throw Error('No overlay image found in render queue')
        // CHANGE IMAGE
        this.renderQueue.overlay[0].windowImage = await this.createWindowImage(imageObject.src)
        this.renderQueue.overlay[0].width = imageObject.width * this.canvasToWallRation
        this.renderQueue.overlay[0].height = imageObject.height * this.canvasToWallRation
        // SIGNAL RENDER
        this.renderOverlay = true
      },

      isImageObjectVisible (imageObject) {
        return !(
          // IS TOO FAR BOTTOM
          this.$refs.backgroundCanvas.height < imageObject.position.y ||
          // IS TOO FAR RIGHT
          this.$refs.backgroundCanvas.width < imageObject.position.x ||
          // IS TOO FAR TOP
          0 > imageObject.position.y + imageObject.height * this.scale ||
          // IS TOO FAR LEFT
          0 > imageObject.position.x + imageObject.width * this.scale
        )
      },

      runRenderQueue () {

        // If there is no background canvas, dont render on it
        if(!this.$refs.backgroundCanvas) return;

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
        if (newScale > 30) newScale = 30
        if (newScale < 0.3) newScale = 0.3
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
        if(!this.$refs.backgroundCanvas) return;

        const containerWidth = this.$refs.backgroundCanvas.width

        const smallerThanContainerScale = 0.95
        const newScale = (this.$refs.backgroundCanvas.width / config.canvas.width) * smallerThanContainerScale

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
        const backgroundBoundingBox = this._getBackgroundBoundingRect()
        return {
          x: (overlayPos.x - backgroundBoundingBox.x)  / this.canvasToWallRation / this.scale,
          y: (overlayPos.y - backgroundBoundingBox.y) / this.canvasToWallRation / this.scale
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
        if (boundingRect.x + x > this.$refs.backgroundCanvas.width - maxOffset) x = 0

        // BOTTOM
        if (boundingRect.y + y > this.$refs.backgroundCanvas.height - maxOffset) y = 0

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

      isUserClickingOnOverlay (overlay, { clientX, clientY }) {
        // Click coordinates get scaled with CSS scaling
        // Also the offsetParent has changed so now getBoundingClientRect is used
        const currentClick = {
          x: clientX - (this.$el.getBoundingClientRect().left + window.scrollX),
          y: clientY - (this.$el.getBoundingClientRect().top + window.scrollY)
        }

        const localCoords = {
          x: currentClick.x / this.cssToCanvasRatio / this.scale - overlay.position.x / this.scale,
          y: currentClick.y / this.cssToCanvasRatio / this.scale - overlay.position.y / this.scale,
        }

        return localCoords.x > 0
          && localCoords.y > 0
          && localCoords.x < overlay.width
          && localCoords.y < overlay.height
      },

      onMoveEvent ({ clientX, clientY }) {
        // CHECK IF OLD POS IS NOT DEFAULT
        if (this.lastPos.x !== -1 && this.lastPos.y !== -1) {

          let offsetTop = this.$refs.canvasContainer.offsetTop / this.cssToCanvasRatio
          let offsetLeft = this.$refs.canvasContainer.offsetLeft / this.cssToCanvasRatio

          // CHECK IF FINGER MOVED
          let dist = this.getDistance({
            x: clientX - offsetLeft,
            y: clientY - offsetTop
          }, this.lastPos)

          if (dist > 0) {
            // MOVE CANVAS
            let diff = {
              x: clientX - offsetLeft - this.lastPos.x,
              y: clientY - offsetTop - this.lastPos.y,
            }
            if (this.moveTarget === 'stage') this.updateCanavsPosition(diff)
            else if (this.moveTarget) {
              this.updateOverlayPosition(this.moveTarget, diff)
            }

            this.lastPos = {
              x: clientX - offsetLeft,
              y: clientY - offsetTop
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
          x: scaleCenter.x - this.$refs.canvasContainer.offsetLeft / this.cssToCanvasRatio,
          y: scaleCenter.y - this.$refs.canvasContainer.offsetTop / this.cssToCanvasRatio
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

        //event.preventDefault()

        let touch1 = event.touches[0]
        let touch2 = event.touches[1]

        if (touch1 && touch2) {

          let dist = this.getDistance({
            x: touch1.clientX / this.cssToCanvasRatio,
            y: touch1.clientY / this.cssToCanvasRatio
          }, {
            x: touch2.clientX / this.cssToCanvasRatio,
            y: touch2.clientY / this.cssToCanvasRatio
          })

          let center = {
            x: ((touch1.clientX + touch2.clientX) / this.cssToCanvasRatio) / 2,
            y: ((touch1.clientY + touch2.clientY) / this.cssToCanvasRatio) / 2
          }

          let newScale = this.scale * dist / this.lastDist

          this.onScaleEvent(center, newScale)
          this.lastDist = dist

        } else if (touch1) {
          this.onMoveEvent({
            clientX: touch1.clientX / this.cssToCanvasRatio,
            clientY: touch1.clientY / this.cssToCanvasRatio
          })
        }
      },
      onTouchEndEvent (event) {
        //event.preventDefault()
        this.lastDist = 0
        this.lastPos = {
          x: -1,
          y: -1
        }
        this.moveTarget = null
      },
      onTouchStartEvent (event) {

        //event.preventDefault()

        let touch1 = event.touches[0]

        if (event.touches.length === 1) {
          this.lastPos = {
            x: touch1.clientX / this.cssToCanvasRatio - this.$refs.canvasContainer.offsetLeft / this.cssToCanvasRatio,
            y: touch1.clientY / this.cssToCanvasRatio - this.$refs.canvasContainer.offsetTop / this.cssToCanvasRatio
          }
        } else if (event.touches.length === 2) {
          let touch2 = event.touches[1]
          this.lastDist = this.getDistance({
            x: touch1.clientX / this.cssToCanvasRatio,
            y: touch1.clientY / this.cssToCanvasRatio
          }, {
            x: touch2.clientX / this.cssToCanvasRatio,
            y: touch2.clientY / this.cssToCanvasRatio
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
        //event.preventDefault()

        const scaleBy = 1.1

        const cursorPosOnStart = {
          x: event.clientX / this.cssToCanvasRatio,
          y: event.clientY / this.cssToCanvasRatio
        }

        const newScale = event.deltaY > 0 ? this.scale * scaleBy : this.scale / scaleBy

        this.onScaleEvent(cursorPosOnStart, newScale)

      },
      onMouseDownEvent (event) {

        this.lastPos = {
          x: (event.clientX - this.$refs.canvasContainer.offsetLeft) / this.cssToCanvasRatio,
          y: (event.clientY - this.$refs.canvasContainer.offsetTop) / this.cssToCanvasRatio
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
        //event.preventDefault()
        this.onMoveEvent({
          clientX: event.clientX / this.cssToCanvasRatio,
          clientY: event.clientY / this.cssToCanvasRatio
        })
      },
    }
    ,
    async mounted () {
      // SET STAGE WIDTH
      this.width = window.innerWidth
      //this.height = Number(this.height) ? Number(this.height) : 300

      if(!this.$refs.overlayCanvas || !this.$refs.backgroundCanvas) return;

      this.$refs.overlayCanvas.width = this.canvasSettings.width
      this.$refs.overlayCanvas.height = this.canvasSettings.width * (this.height / this.width)

      this.$refs.backgroundCanvas.width = this.canvasSettings.width
      this.$refs.backgroundCanvas.height = this.canvasSettings.width * (this.height / this.width)

      this.cssToCanvasRatio = this.width / this.canvasSettings.width
      this.canvasToWallRation = this.canvasSettings.width / this.canvasSettings.realWidth

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

      if (this.draggable && this.$refs.stageWrapper) {
        /*
        MOBILE DRAG AND ZOOM HANDLER
         */

        this.$refs.stageWrapper.addEventListener('touchstart', this.onTouchStartEvent, {passive: true})
        this.$refs.stageWrapper.addEventListener('touchmove', this.onTouchMoveEvent, {passive: true})
        this.$refs.stageWrapper.addEventListener('touchend', this.onTouchEndEvent, {passive: true})

        /*
        DESKTOP DRAG AND ZOOM HANDLER
         */

        this.$refs.stageWrapper.addEventListener('wheel', this.onWheelEvent, {passive: true})
        this.$refs.stageWrapper.addEventListener('mousedown', this.onMouseDownEvent, {passive: true})
        this.$refs.stageWrapper.addEventListener('mousemove', this.onMouseMoveEvent, {passive: true})
        this.$refs.stageWrapper.addEventListener('mouseup', this.onMouseUpEvent, {passive: true})
        this.$refs.stageWrapper.addEventListener('mouseleave', this.onMouseUpEvent, {passive: true})
      }
    }
    ,
    beforeDestroy: function () {
      this.$refs.stageWrapper.removeEventListener('touchstart', this.onTouchStartEvent)
      this.$refs.stageWrapper.removeEventListener('touchmove', this.onTouchMoveEvent)
      this.$refs.stageWrapper.removeEventListener('touchend', this.onTouchEndEvent)
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
