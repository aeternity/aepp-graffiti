<template>
  <NativeCanvas :height=height :draggable=true :fill-scale=true></NativeCanvas>
</template>

<script>
  import NativeCanvas from '../../components/NativeCanvas'

  export default {
    name: 'Canvas',
    components: { NativeCanvas },
    data() {
      return {
        height: window.innerHeight
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
