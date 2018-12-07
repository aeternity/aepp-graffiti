<template>
  <div ref="stageWrapper" class="stageWrapper">
    <v-stage ref="stage" :config="configKonva">
      <v-layer ref="layer">
        <template v-for="image in images">
          <CanvasImage @imageLoad="runUpdate" :image-src="image.src" :image-position="image.position"></CanvasImage>
        </template>
        <v-circle :config="configCircle"></v-circle>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
  import CanvasImage from './CanvasImage.vue'
  export default {
    name: 'Canvas',
    components: { CanvasImage },
    data () {
      return {
        configKonva: {
          width: `auto`,
          height: 200,
          draggable: true
        },
        configCircle: {
          x: 100,
          y: 100,
          radius: 70,
          fill: 'red',
          stroke: 'black',
          strokeWidth: 4
        },
        stage: null
      }
    },

    computed: {
      images() {
        return this.$store.state.images;
      }
    },
    methods: {
      runUpdate() {
        if(!this.$refs) return;
        const stage = this.$refs.stage.getStage();
        if(!stage.batchDraw) return;
        console.log(stage);
        stage.batchDraw();
      }
    },
    created() {
      this.$store.dispatch(`loadImages`);
    },
    mounted () {
      // SET STAGE WIDTH
      const width = this.$refs.stageWrapper.clientWidth;
      this.stage = this.$refs.stage.getStage();
      this.stage.width(width)
      this.stage.batchDraw();
    }
  }
</script>

<style scoped>
.stageWrapper {
  width: 100%;
}
</style>
