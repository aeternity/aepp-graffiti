<template>
  <div>
    <div class="w-full pl-4 pr-4 flex">
      <h1 class="w-full text-center">Contribute</h1>
    </div>
    <div class="w-full p-4 flex justify-center">
      <form enctype="multipart/form-data" novalidate v-if="isInitial" class="w-full">
        <div class="dropbox border relative flex justify-center items-center h-64">
          <input type="file" name="image" ref="uploadInput"
                 @change="filesChange($event.target.files)"
                 accept="image/*" class="absolute pin opacity-0 w-full h-full">
          <p v-if="isInitial" class="p-4 text-center">
            Upload Image. <br> Click to browse.
          </p>
        </div>
      </form>
      <div v-if="isSuccess">
        <div class="w-full flex justify-center p-4">
          <img ref="image" class="w-full h-full" :src="uploadedImage.src" :alt="uploadedImage.name">
        </div>
        <div class="w-full flex justify-center p-4">
          <ae-button class="mr-4" type="normal" @click="reset">Reset</ae-button>
          <ae-button type="dramatic" @click="$router.push(`render`)">Preview Artwork</ae-button>
        </div>
      </div>
      <div v-if="isError" class="w-full p-4">
        <div class="w-full flex justify-center p-4">
          <span class="text-xl text-red">{{error}}</span>
        </div>
        <div class="w-full flex justify-center p-4">
          <ae-button  type="normal" @click="reset">Ok</ae-button>
        </div>
      </div>
    </div>

  </div>

</template>

<script>

  const STATUS_INITIAL = 0, STATUS_SUCCESS = 2, STATUS_ERROR = 3

  export default {
    name: 'Upload',
    components: {},
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
      isError () {
        return this.currentStatus === STATUS_ERROR
      },
      uploadedImage () {
        return this.$store.state.uploadedImage
      }
    },
    methods: {
      reset () {
        this.currentStatus = STATUS_INITIAL
      },
      filesChange (fileList) {
        // handle file changes
        const file = fileList[0]

        if (file.size > 1000000) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Maximum allowed file size is 1 MB'
          return
        }

        if (!file.type.includes('image')) {
          this.currentStatus = STATUS_ERROR
          this.error = 'Please upload an image'
          return
        }

        this.$store.dispatch(`uploadImage`, file)
        this.currentStatus = STATUS_SUCCESS
      }
    }
  }
</script>

<style scoped>

</style>
