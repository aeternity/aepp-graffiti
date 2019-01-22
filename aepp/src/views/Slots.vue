<template>
  <div>
    <InfoLayer>
      <h2>Slots</h2>
      <p class="p-4 pb-0">
        The bidding slots are fixed length auctions. While a slot is open, meaning the maximum block
        height is not reached, you may add your bid. Once the maximum block height is reached by the network the smart
        contract will take all top bids and send them to the drones to paint.
      </p>
    </InfoLayer>
    <div class="w-full pl-8 pr-8 text-center">
      <h1 class="w-full text-center mb-4">Auction Slots</h1>
      <h3>Current Block Height: <span class="font-mono">{{height}}</span></h3>
    </div>
    <div class="w-full p-8 flex justify-center items-center">

      <div v-if="isLoadingState">
        <BiggerLoader></BiggerLoader>
      </div>

      <div v-if="isShowListState" class="w-full">
        <div v-for="slot in slots" class="w-full">
          <ae-card class="mb-4 w-full">
            <div class="flex flex-col relative w-full" @click="selectSlot(slot.id)">

              <div class="absolute pin-t pin-r">
                <ae-check v-model="choice" :value="slot.id" type="radio">
                </ae-check>
              </div>

              <div>
                <h2 class="text-black">Slot {{slot.id}} ({{slot.successfulBids.length}} Bids)</h2>
              </div>
              <div class="flex flex-col pr-6">
                <span>
                  Estimated time left
                </span>
                <span class="font-mono text-black text-lg">
                  <Countdown :initialTime="(slot.endBlockHeight - height) * 350"></Countdown>
                </span>
              </div>
              <div class="flex flex-col pr-6">
                <span>
                  Minimum Bid / Minute
                </span>
                <span class="font-mono text-black text-lg" v-if="slot.successfulBids.length > 0">
                  {{slot.minimumBid.toFixed(5)}} AE
                </span>
                <span class="font-mono text-black text-lg" v-else>
                  0 AE (No Bids)
                </span>
              </div>

              <!--
              <div class="flex flex-row justify-between">
                <div class="flex flex-col pr-6">
                <span>
                  From
                </span>
                  <span class="font-mono text-black text-lg">
                  {{slot.startBlockHeight}}
                </span>
                </div>
                <div class="flex flex-col pr-6">
                <span>
                  To
                </span>
                  <span class="font-mono text-black text-lg">
                  {{slot.endBlockHeight}}
                </span>
                </div>
                <div class="flex flex-col pr-6">
                <span>
                  Time
                </span>
                  <span class="font-mono text-black text-lg">
                  {{slot.timeCapacity}}
                </span>
                </div>
                <div class="flex flex-col" v-if="slot.startBlockHeight < height && slot.endBlockHeight > height">
                <span>
                  &nbsp;
                </span>
                  <span class="font-mono text-black text-lg">
                  ACTIVE
                </span>

                </div>
              </div>
              <div class="flex flex-row justify-between">
                <div class="flex flex-col pr-6">
                <span>
                  Maximum Bid Per Minute
                </span>
                  <span class="font-mono text-black text-lg">
                  {{slot.maximumTimePerBid}}
                </span>
                </div>
                <div class="flex flex-col pr-6">
                <span>
                  Minimum Bid Per Minute
                </span>
                  <span class="font-mono text-black text-lg">
                  {{slot.minimumTimePerBid}}
                </span>
                </div>
                <div class="flex flex-col pr-6">
                <span>
                  Time
                </span>
                  <span class="font-mono text-black text-lg">
                  {{slot.timeCapacity}}
                </span>
                </div>
                <div class="flex flex-col" v-if="slot.startBlockHeight < height && slot.endBlockHeight > height">
                <span>
                  &nbsp;
                </span>
                  <span class="font-mono text-black text-lg">
                  ACTIVE
                </span>
                </div>
              </div>
              -->
            </div>

          </ae-card>
        </div>
        <div v-if="choice">
          <div class="w-full">
            <ae-list>
              <ae-list-item>
                <ae-button face="round" fill="primary" @click="next" extend>Continue</ae-button>
              </ae-list-item>
              <ae-list-item @click="$router.push('positioning')" class="justify-center">
                <ae-text face="uppercase-base" weight="bold">Back</ae-text>
              </ae-list-item>
            </ae-list>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import InfoLayer from '@/components/InfoLayer'
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
  import axios from 'axios'
  import Util from '../utils/blockchain_util'
  import BiggerLoader from '@/components/BiggerLoader'
  import Countdown from '@/components/Countdown'

  const SHOW_LIST = 1, EMPTY_LIST = 2, LOADING = 3

  export default {
    name: 'Slots',
    components: { Countdown, BiggerLoader, InfoLayer },
    data () {
      return {
        state: LOADING,
        bids: [],
        slots: [],
        client: null,
        height: 0,
        choice: null
      }
    },
    computed: {
      isLoadingState () {
        return this.state === LOADING
      },
      isShowListState () {
        return this.state === SHOW_LIST
      },
      isEmptyListState () {
        return this.state === EMPTY_LIST
      },
      blockchainSettings () {
        return this.$store.state.blockchainSettings
      }
    },
    methods: {
      async updateMyBids () {
        const calledAllBids = await this.client.contractEpochCall(String(this.blockchainSettings.contractAddress), 'sophia-address', 'all_auction_slots', '()', '').catch(e => console.error(e))

        const decodedAllBids = await this.client.contractEpochDecodeData(Util.auctionSlotListType, calledAllBids.out).catch(e => console.error(e))

        this.slots = Util.auctionSlotListToObject(decodedAllBids).map(slot => {
          slot.minimumBid = Math.min.apply(Math, slot.successfulBids.map(function(bid) { return bid.amountPerTime; }))
          slot.minimumBid = slot.successfulBids.length === 0 ? 0 : Util.atomsToAe(slot.minimumBid);
          return slot
        })

        console.log(this.slots)

        if (this.slots.length > 0) this.state = SHOW_LIST
        else return this.state = EMPTY_LIST

        /*
        this.bids = await Promise.all(this.bids.map(async bid => {
          let response = await axios.get(this.$store.state.apiUrl + '/ipfs?hash=' + bid.data.artworkReference)
          bid.image = 'data:image/svg+xml;base64,' + btoa(response.data)
          return bid
        }))
        */
      },
      selectSlot(slotId) {
        this.choice = slotId
      },
      next() {
        this.$router.push('confirm')
      }
    },
    created () {
      Aepp().then(async ae => {
        this.client = ae
        this.height = await this.client.height()
        console.log(this.height)
        await this.updateMyBids()
      })
    }
  }
</script>

<style scoped>

</style>
