<template>
  <div>
    <img :src=svgURL alt="Graffiti SVG" />
  </div>
</template>

<script>
  import config from '~/config'

  export default {
    name: "StaticSVG",
    data() {
      return {
        network: '',
        svgURL: config.canvas.url(this.network),
        reloadInterval: null,
        reloadTime: 30000
      }
    },
    created() {
      this.network = this.$route.query.testnet ? '' : 'mainnet';
      this.svgURL = `${config.canvas.url(this.network)}?date=${Date.now()}`
      this.reloadInterval = setInterval(() => {
        this.svgURL = `${config.canvas.url(this.network)}?date=${Date.now()}`
      }, this.reloadTime)
    },
    beforeDestroy() {
      clearInterval(this.reloadInterval)
    }
  }
</script>

<style scoped>
  div {
    height: 100vh;
    width: 100vw;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  img {
    max-height: 100%;
    max-width: 100%;
  }
</style>
