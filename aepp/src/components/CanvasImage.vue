<template>
  <v-image :config="configImg"></v-image>
</template>

<script>
  export default {
    name: 'CanvasImage',
    props: [`imageSrc`, `imagePosition`],
    data () {
      return {
        windowImage: new Image(),
        size: [0,0]
      }
    },
    computed: {
      configImg: function() {
        return {
          x: this.imagePosition.x,
          y: this.imagePosition.y,
          image: this.windowImage,
          width: this.size[0],
          height: this.size[1],
        }
      }
    },
    created() {
      this.windowImage.onload = this.adjustSize();
      this.windowImage.src = this.imageSrc;
    },
    methods: {
      adjustSize() {
        console.log(this.windowImage.width, this.windowImage.height);
        this.size = [this.windowImage.width, this.windowImage.height];
      }
    },
    updated() {
      console.log(this.windowImage.width, this.windowImage.height);
      this.$emit('imageLoad');
    }
  }
</script>

<style scoped>

</style>
