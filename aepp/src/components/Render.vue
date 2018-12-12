<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Artwork Preview</h1>
    </div>
    <div class="w-full p-4 flex">
      <div class="w-full flex justify-center items-center">
        <div v-if="transformedImage">
          <div class="w-full">
            <img ref="previewImage" :src="transformedImage.src" :alt="transformedImage.name"/>
          </div>
          <div class="w-full mb-8">
            <form>
              <div>
                <ae-label class="no-margin">Size</ae-label>
                <div class="flex flex-row justify-space items-center">
                  <div class="w-1/2">
                    <input ref="" type="range" v-model="size"/>
                  </div>
                  <div class="w-1/2">
                    <ae-input class="no-margin" type="number" v-model="size"></ae-input>
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
        size: 50
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
      setSize () {
        this.$store.dispatch('updateSettings', {
          size: this.size
        })
      },
      submit () {
        this.setSize()
        this.$store.dispatch(`transformImage`);
        this.$router.push('positioning');
      }
    },
    watch: {
      size: function (value) {
        this.$refs.previewImage.style.transform = `scale(${this.size / 100})`
      }
    },
    mounted () {
      this.size = this.$store.state.transformationSettings.size
      this.$store.dispatch(`transformImage`)
    }
  }
</script>

<style scoped>
  .no-margin {
    margin: 0 !important;
  }
</style>
