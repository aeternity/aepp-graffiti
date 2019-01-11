<template>
  <div>
    <div class="p-4 pb-0" v-for="slot in slots">
      <ae-card>
        <div class="flex flex-row justify-between">
          <div class="flex flex-col pr-6">
            <span>
              From
            </span>
            <span class="font-mono text-black text-lg">
              {{slot.firstBlock}}
            </span>
          </div>
          <div class="flex flex-col pr-6">
            <span>
              To
            </span>
            <span class="font-mono text-black text-lg">
              {{slot.lastBlock}}
            </span>
          </div>
          <div class="flex flex-col pr-6">
            <span>
              Time
            </span>
            <span class="font-mono text-black text-lg">
              {{slot.timeAvailable}}
            </span>
          </div>
          <div class="flex flex-col" v-if="slot.firstBlock < height && slot.lastBlock > height">
            <span>
              &nbsp;
            </span>
            <span class="font-mono text-black text-lg">
              ACTIVE
            </span>
          </div>
        </div>
      </ae-card>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'

  export default {
    name: 'BiddingSlots',
    data () {
      return {
        slots: [],
        client: null,
        height: 0
      }
    },
    async created () {
      try {
        const response = await axios.get(this.$store.state.apiUrl + '/slots')
        this.slots = response.data.slots

        this.client = await Aepp()
        this.height = await this.client.height()
        console.log(this.height)

      } catch (e) {
        console.error(e)
      }
    }
  }
</script>

<style scoped>

</style>
