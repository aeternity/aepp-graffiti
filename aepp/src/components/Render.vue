<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Artwork Preview</h1>
    </div>
    <div class="w-full p-4 flex">
      <div class="w-full flex justify-center items-center">
        <div v-if="transformedImage.src">
          <div class="w-full">
            <img @load="updateMetaData" ref="previewImage" :style="scaleCSSProperty" :src="transformedImage.src" />
          </div>
          <div class="w-full mb-8">
            <form>
              <div>
                <ae-label class="no-margin">Scale</ae-label>
                <div class="flex flex-row justify-space items-center">
                  <div class="w-1/2">
                    <input type="range" v-model="scale"/>
                  </div>
                  <div class="w-1/2">
                    <ae-input class="no-margin" type="number" v-model="scale"></ae-input>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="mt-4 w-full flex justify-center">
            <ae-button face="round" fill="primary" @click="submit">Continue</ae-button>
          </div>
        </div>
        <div v-else class="border">
          <ae-loader class="ae-loader-scaling"></ae-loader>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  const STATUS_INITIAL = 0, STATUS_SUCCESS = 1

  export default {
    name: 'Render',
    data () {
      return {
        scale: 50,
      }
    },
    computed: {
      isInitial () {
        return this.currentStatus === STATUS_INITIAL
      },
      isSuccess () {
        return this.currentStatus === STATUS_SUCCESS
      },
      originalImage () {
        return this.$store.state.originalImage
      },
      transformedImage () {
        return this.$store.state.transformedImage
      },
      settings () {
        return this.$store.state.settings
      },
      scaleCSSProperty() {
        return `scale(${this.scale / 100})`
      }
    },
    methods: {
      setScale () {
        this.$store.dispatch('updateSettings', {
          scaleFactor: this.scale / 100
        })
      },
      submit () {
        this.setScale()
        this.$router.push('positioning')
      },
      updateMetaData () {
        console.log('Updating Meta Data');
        this.$store.dispatch(`updateTransformedImage`, {
          width: this.$refs.previewImage.naturalWidth,
          height: this.$refs.previewImage.naturalHeight
        })
      }
    },
    watch: {
      scale: function () {
        if (this.transformedImage.src)
          this.$refs.previewImage.style.transform = `scale(${this.scale / 100})`
      }
    },
    mounted () {
      console.log(this.transformedImage.src)
      if (this.settings.scaleFactor !== null) {
        this.scale = this.settings.scaleFactor * 100
      }
    }
  }
</script>

<style scoped>
  .no-margin {
    margin: 0 !important;
  }
</style>
