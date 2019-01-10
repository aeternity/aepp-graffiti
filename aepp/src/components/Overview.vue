<template>
  <div>
    <div class="w-full p-4">
      <h1 class="text-center">Your Bids</h1>
    </div>
    <div class="w-full p-4 text-center" v-if="isInitialState">
      <ae-loader class="p-4"></ae-loader>
    </div>

    <div class="w-full p-4" v-if="isShowListState">
      <div v-for="bid in bids">
        <ae-card class="mb-4" :key='Date.now()'>

          <template slot="header">
            <img :src='bid.image' v-if="bid.image" class="w-full">
            <div class="w-full text-center mt-4" v-else>
              <ae-loader class="p-4"></ae-loader>
            </div>
          </template>
          <div class="w-full">
            <div class="w-full">
              Position: X {{bid.coordinates.x}}  Y {{bid.coordinates.y}}
            </div>
            <div class="w-full">
              Dronetime: {{bid.droneTime}} Seconds
            </div>
            <div class="w-full">
              Amount: {{bid.amount}} AE
            </div>
            <div class="w-full">
              State: Successful
            </div>
          </div>
        </ae-card>

      </div>
    </div>
    <div class="w-full p-4" v-if="isEmptyListState">
      <h2 class="text-center">No bids found.</h2>
    </div>
  </div>

</template>

<script>
  import Aepp from 'AE_SDK_MODULES/ae/aepp'
  import * as Crypto from '@aeternity/aepp-sdk/es/utils/crypto'
  import axios from 'axios'

  const INITAL_STATE = 0, SHOW_LIST = 1, EMPTY_LIST = 2;

  export default {
    name: 'Overview',
    data () {
      return {
        bids: [],
        state: INITAL_STATE,
        address: null
      }
    },
    computed: {
      blockchainSettings() {
        return this.$store.state.blockchainSettings
      },
      isInitialState() {
        return this.state === INITAL_STATE
      },
      isShowListState() {
        return this.state === SHOW_LIST
      },
      isEmptyListState() {
        return this.state === EMPTY_LIST
      }
    },
    methods: {
      bidListToObject (bidList) {
        return bidList.value.map(bid => {
          return {
            user: Crypto.addressFromDecimal(bid.value[0].value),
            hash: bid.value[1].value,
            coordinates: {
              x: bid.value[2].value[0].value,
              y: bid.value[2].value[1].value
            },
            droneTime: bid.value[3].value,
            amount: bid.value[4].value
          }
        })
      },
      async updateMyBids()  {
        const calledAllBids = await this.client.contractEpochCall(this.blockchainSettings.contractAddress, 'sophia-address', 'all_bids', '()').catch(e => console.error(e))
        const decodedAllBids = await this.client.contractEpochDecodeData('list((address, string, (int, int), int, int))', calledAllBids.out).catch(e => console.error(e))
        this.bids =  this.bidListToObject(decodedAllBids).filter(bid => bid.user === this.address)

        if(this.bids.length > 0) this.state = SHOW_LIST
        else return this.state = EMPTY_LIST

        this.bids = await Promise.all(this.bids.map( async bid => {
          let response = await axios.get(this.$store.state.apiUrl + "/ipfs?hash=" + bid.hash);
          bid.image = 'data:image/svg+xml;base64,' + btoa(response.data);
          return bid;
        }))
      }
    },
    created () {
      Aepp().then(async ae => {
        this.client = ae
        this.address = await this.client.address()
        await this.updateMyBids();
      })
    }
  }
</script>

<style scoped>

</style>
