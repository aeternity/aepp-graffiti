<template>
  <div ref="stageWrapper" class="relative w-full min-h-screen">
    <div ref="background" :style="backgroundStyle" class="absolute w-full h-full"></div>
    <div ref="overlay"></div>
  </div>
</template>

<script>
  import config from '../config'
  import aeternity from '../utils/aeternityNetwork'

  export default {
    name: 'CSSCanvas',
    data () {
      return {
        backgroundCSS: 'transparent',
        left: 0,
        top: 0,
        lastPos: {
          x: -1,
          y: -1
        },
        currentCursor: {
          x: -1,
          y: -1
        },
      }
    },
    computed: {
      backgroundStyle() {
        return {
          background: this.backgroundCSS,
          left: `${this.left}px`,
          top: `${this.top}px`
        }
      }
    },
    methods: {
      onMouseDownEvent (event) {
        if(!event.clientX) event = event.touches[0]

        this.lastPos = {
          x: event.clientX - this.$refs.stageWrapper.offsetLeft,
          y: event.clientY - this.$refs.stageWrapper.offsetTop
        }
        this.moveTarget = 'stage'

      },
      onMouseUpEvent () {

        this.lastPos = {
          x: -1,
          y: -1
        }
        this.moveTarget = null
      },
      onMouseMoveEvent (event) {

        if(!event.clientX) event = event.touches[0]


        let offsetTop = this.$refs.stageWrapper.offsetTop
        let offsetLeft = this.$refs.stageWrapper.offsetLeft

        this.currentCursor = {
          x: event.clientX - offsetLeft,
          y: event.clientY - offsetTop
        }

        // GET OLD POS
        let { x, y } = this.lastPos
        // CHECK IF OLD POS IS NOT DEFAULT
        if (x !== -1 && y !== -1) {
          // MOVE CANVAS
          let diff = {
            x: event.clientX - offsetLeft - this.lastPos.x,
            y: event.clientY - offsetTop - this.lastPos.y,
          }

          if (this.moveTarget === 'stage') this.updateCanavsPosition(diff)
          else if (this.moveTarget === 'overlay') {
            const newDiff = {
              xDiff: diff.xDiff / this.stage.scaleX(),
              yDiff: diff.yDiff / this.stage.scaleX()
            }
            this.moveOverlayImage(newDiff)
          }

          this.lastPos = {
            x: event.clientX - offsetLeft,
            y: event.clientY - offsetTop
          }
        }
      },
      updateCanavsPosition ({ x, y }) {
        this.left += x
        this.top += y
      }
    },
    mounted () {
      this.backgroundCSS = `url(${config.canvas.urlSmall(aeternity.network)}) no-repeat`

      this.$refs.background.addEventListener('mousedown', this.onMouseDownEvent)
      this.$refs.background.addEventListener('mousemove', this.onMouseMoveEvent)
      this.$refs.background.addEventListener('mouseup', this.onMouseUpEvent)
      this.$refs.background.addEventListener('mouseleave', this.onMouseUpEvent)
      this.$refs.background.addEventListener('touchstart', this.onMouseDownEvent)
      this.$refs.background.addEventListener('touchmove', this.onMouseMoveEvent)
      this.$refs.background.addEventListener('touchend', this.onMouseUpEvent)
      //}

      console.log('canvas mounted')
    },
    beforeDestroy: function () {
      this.$refs.background.removeEventListener('mousedown', this.onMouseDownEvent)
      this.$refs.background.removeEventListener('mousemove', this.onMouseMoveEvent)
      this.$refs.background.removeEventListener('mouseup', this.onMouseUpEvent)
      this.$refs.background.removeEventListener('mouseleave', this.onMouseUpEvent)
      this.$refs.background.removeEventListener('touchstart', this.onMouseDownEvent, false)
      this.$refs.background.removeEventListener('touchmove', this.onMouseMoveEvent, false)
      this.$refs.background.removeEventListener('touchend', this.onMouseUpEvent, false)
    },
  }
</script>

<style scoped>

</style>
