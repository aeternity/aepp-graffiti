<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Artwork Preview</h1>
    </div>
    <div class="w-full p-4 flex">
      <div class="w-full flex justify-center items-center">
        <div v-if="transformedImage">
          <div class="w-full">
            <img @load="updateMetaData" ref="previewImage" :src="transformedImage.src" :alt="transformedImage.name"/>
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
            <ae-button type="dramatic" @click="submit">Continue</ae-button>
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
        scale: 50
      }
    },
    computed: {
      isInitial () {
        return this.currentStatus === STATUS_INITIAL
      },
      isSuccess () {
        return this.currentStatus === STATUS_SUCCESS
      },
      uploadedImage () {
        return this.$store.state.uploadedImage
      },
      transformedImage () {
        return this.$store.state.transformedImage
      }
    },
    methods: {
      setScale () {
        this.$store.dispatch('updateSettings', {
          scale: this.scale
        })
      },
      submit () {
        this.setScale()
        //this.$store.dispatch(`transformImage`);
        this.$router.push('positioning');
      },
      updateMetaData() {
        this.$store.dispatch(`updateTransformedImage`, {
          originalSize: {
            width: this.$refs.previewImage.width,
            height: this.$refs.previewImage.height
          }
        })
      }
    },
    watch: {
      scale: function () {
        this.$refs.previewImage.style.transform = `scale(${this.scale / 100})`
      }
    },
    mounted () {
      this.scale = this.$store.state.transformationSettings.scale
      this.$store.dispatch(`transformImage`)
    }
  }
</script>

<style scoped>
  .no-margin {
    margin: 0 !important;
  }
</style>
