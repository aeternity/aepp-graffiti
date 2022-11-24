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
        network: 'ae_mainnet',
        svgURL: config.canvas.urlSvg(this.network),
        reloadInterval: null,
        reloadTime: 30000
      }
    },
    created() {
      this.network = this.$route.query.testnet ? 'ae_uat' : 'ae_mainnet';
      this.svgURL = `${config.canvas.urlSvg(this.network)}?date=${Date.now()}`
      this.reloadInterval = setInterval(() => {
        this.svgURL = `${config.canvas.urlSvg(this.network)}?date=${Date.now()}`
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
    background-color: black;
  }
  img {
    max-height: 100%;
    max-width: 100%;
  }
</style>
