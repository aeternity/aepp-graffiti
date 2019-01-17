<template>
  <div>

    <InfoLayer>
      <h2>Uploading an Image</h2>
      <p class="p-4 pb-0">
        On this page you are asked to upload an image. It will accept most common image formats including but not limited to: jpg, jpeg, png
      </p>
      <p class="p-4 pb-0">
        Please do not upload SVG images, the SVG for the drone will be created later in this process and there will be options to adjust the final appearance.
      </p>
    </InfoLayer>

    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Contribute</h1>
    </div>

    <div class="w-full p-4 flex justify-center">
      <div class="w-full" v-if="isInitial">
        <form enctype="multipart/form-data" novalidate class="w-full">
          <div class="dropbox border relative flex justify-center items-center h-64">
            <input type="file" name="image" ref="uploadInput"
                   @change="filesChange($event.target.files)"
                   accept="image/*" class="absolute pin opacity-0 w-full h-full">
            <p v-if="isInitial" class="p-4 text-center">
              Upload an JPEG or PNG image. <br> Click to browse.
            </p>
          </div>
        </form>
        <div class="w-full p-4">
          <ae-list>
            <ae-list-item @click="back" class="justify-center">
              <ae-text face="uppercase-base" weight="bold">Return to Homepage</ae-text>
            </ae-list-item>
          </ae-list>
        </div>
      </div>

      <div class="w-full p-4 text-center" v-if="isLoading">
        <BiggerLoader></BiggerLoader>
      </div>

      <div v-if="originalImage.src">
        <div class="w-full flex justify-center p-4">
          <img ref="image" class="w-full h-full" @load="imageLoad" :src="originalImage.src" :alt="originalImage.name">
        </div>
        <div class="w-full p-4">
          <ae-list>
            <ae-list-item class="justify-center">
              <ae-button face="round" fill="primary" @click="next" extend>Preview Artwork</ae-button>
            </ae-list-item>
            <ae-list-item @click="reset" class="justify-center">
              <ae-text face="uppercase-base" weight="bold">Reset</ae-text>
            </ae-list-item>
          </ae-list>

        </div>
      </div>
      <div v-if="isError" class="w-full p-4">
        <div class="w-full flex justify-center p-4">
          <span class="text-xl text-red">{{error}}</span>
        </div>
        <div class="w-full flex justify-center p-4">
          <ae-button face="round" fill="primary" @click="reset">Ok</ae-button>
        </div>
      </div>
    </div>

  </div>

</template>

<script>

  import InfoLayer from './InfoLayer'
  import BiggerLoader from "./BiggerLoader";

  const STATUS_INITIAL = 0, STATUS_LOADING = 1, STATUS_SUCCESS = 2, STATUS_ERROR = 3

  export default {
    name: 'Upload',
    components: {BiggerLoader, InfoLayer },
    data () {
      return {
        fileCount: 0,
        currentStatus: 0,
        uploadError: null,
        error: ''
      }
    },
    computed: {
      isInitial () {
        return this.currentStatus === STATUS_INITIAL
      },
      isSuccess () {
        return this.currentStatus === STATUS_SUCCESS
      },
      isLoading () {
        return this.currentStatus === STATUS_LOADING
      },
      isError () {
        return this.currentStatus === STATUS_ERROR
      },
      originalImage () {
        return this.$store.state.originalImage
      }
    },
    methods: {
      reset () {
        this.currentStatus = STATUS_INITIAL
        this.$store.dispatch('resetImage')
      },
      back() {
        this.$router.push('/');
      },
      filesChange (fileList) {

        this.$store.dispatch('resetState')

        this.currentStatus = STATUS_LOADING
        // handle file changes
        const file = fileList[0]

        /*
        if (file.size > 1000000) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Maximum allowed file size is 1 MB'
          return
        }
        */

        if (!file.type.includes('image')) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Please upload an image'
          return
        }

        if(['image/png', 'image/jpg', 'image/jpeg'].indexOf(file.type) === -1) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Please upload a JPEG or PNG image'
          return
        }

        this.$store.dispatch(`uploadImage`, file)

      },
      imageLoad () {
        this.currentStatus = STATUS_SUCCESS
        this.$store.dispatch(`updateOriginalImage`, {
          width: this.$refs.image.naturalWidth,
          height: this.$refs.image.naturalHeight
        })
      },
      next() {
        this.$router.push(`render`)
      }
    }
  }
</script>

<style scoped>

</style>
