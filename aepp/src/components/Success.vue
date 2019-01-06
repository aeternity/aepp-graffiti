<template>
    <div class="w-full p-4 text-center">
      <h1>Congratulations<br />Bid Successful</h1>
      <ae-button class="mt-8" face="round" fill="primary" @click="$router.push('overview')">Continue to Bid Status</ae-button>
    </div>
</template>

<script>
  export default {
    name: 'Success'
  }
</script>

<style scoped>

</style>
