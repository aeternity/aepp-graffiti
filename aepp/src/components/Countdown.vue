<template>
  <span>
    {{days}}D {{hours}}H {{minutes}}M {{seconds}}S
  </span>
</template>

<script>
  export default {
    name: 'Countdown',
    props: ['initialTime'],
    data() {
      return {
        interval: null,
        timeRunning: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        time: 0
      }
    },
    methods: {
      updateTime() {

        this.timeRunning++;
        this.time = this.initialTime - this.timeRunning;

        this.seconds = Math.floor(this.time % 60);
        this.minutes = Math.floor(this.time % (60 * 60) / 60);
        this.hours = Math.floor(this.time % (24 * 60 * 60) / (60 * 60));
        this.days = Math.floor(this.time / (24 * 60 * 60))
      }
    },
    created() {
      this.updateTime();
      this.interval = setInterval(this.updateTime, 1000)
    },
    beforeDestroy() {
      clearInterval(this.interval)
    }
  }
</script>

<style scoped>

</style>
