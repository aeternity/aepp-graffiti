<template>
  <div>
    <div class="w-full p-4">
      <h1 class="text-center">Your Bids</h1>
    </div>
    <div class="w-full p-4 text-center" v-if="isInitialState">
      <BiggerLoader></BiggerLoader>
    </div>

    <div class="w-full p-4" v-if="isShowListState">
      <div v-for="bid in bids">
        <ae-card class="mb-4" :key='Date.now()'>

          <template slot="header">
            <img :src='bid.image' v-if="bid.image" class="w-full">
            <div class="w-full text-center mt-4" v-else>
              <BiggerLoader></BiggerLoader>
            </div>
          </template>
          <div class="w-full">
            <div class="w-full">
              Position: X {{bid.data.coordinates.x}}  Y {{bid.data.coordinates.y}}
            </div>
            <div class="w-full">
              Dronetime: {{bid.time}} Seconds
            </div>
            <div class="w-full">
              Amount: {{bid.amount/1000000000000000000}} AE
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
  import axios from 'axios'
  import Util from '../utils/blockchain_util'
  import BiggerLoader from "./BiggerLoader";

  const INITAL_STATE = 0, SHOW_LIST = 1, EMPTY_LIST = 2;

  export default {
    name: 'Overview',
    components: {BiggerLoader},
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
      async updateMyBids()  {
        const calledAllBids = await this.client.contractEpochCall(String(this.blockchainSettings.contractAddress), 'sophia-address', 'all_auction_slots', '()', '').catch(e => console.error(e))

        const decodedAllBids = await this.client.contractEpochDecodeData(Util.auctionSlotListType, calledAllBids.out).catch(e => console.error(e))
        this.bids = Util.auctionSlotListToObject(decodedAllBids).map(slot => slot.successfulBids.filter(bid => bid.user === this.address)).flat()

        if(this.bids.length > 0) this.state = SHOW_LIST
        else return this.state = EMPTY_LIST

        this.bids = await Promise.all(this.bids.map( async bid => {
          let response = await axios.get(this.$store.state.apiUrl + "/ipfs?hash=" + bid.data.artworkReference);
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
