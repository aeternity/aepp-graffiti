<template>
  <CanvasJS :height=height :draggable=true ></CanvasJS>
</template>

<script>
  import CanvasJS from '@/components/CanvasJS'
  export default {
    name: 'Canvas',
    components: { CanvasJS },
    data() {
      return {
        height: 500
      }
    },
    created() {
      if(this.$route.query.height) {
        this.height = this.$route.query.height;
      }
    }
  }
</script>

<style scoped>

</style>
