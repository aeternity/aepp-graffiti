<template>
  <div>
    <h2>current height</h2><br>
    <pre>{{height}}</pre>
    <br>
    <h2>slots</h2><br>
    <div class="flex">
      <div class="w-1/6">Slot Id</div>
      <div class="w-1/6">Time Capacity</div>
      <div class="w-1/6">Bid Time Bounds</div>
      <div class="w-1/6">Block Height Bounds</div>
      <div class="w-1/6">Successful Bids</div>
      <div class="w-1/6">Failed Bids</div>
    </div>
    <hr>
    <div v-for="slot in slots">
      <div class="flex slot-row">
        <div class="w-1/6">{{slot.id}}</div>
        <div class="w-1/6">{{slot.timeCapacity}}</div>
        <div class="w-1/6">
          Minimum Time: {{slot.minimumTimePerBid}}<br>
          Maximum Time: {{slot.maximumTimePerBid}}
        </div>
        <div class="w-1/6">
          Start: {{slot.startBlockHeight}}<br>
          <Countdown :initialTime="(slot.startBlockHeight - height) * avgBlockTime"></Countdown>
          <br>
          <br>
          End:&nbsp;&nbsp;{{slot.endBlockHeight}}<br>
          <Countdown :initialTime="(slot.endBlockHeight - height) * avgBlockTime"></Countdown>
          <br>
        </div>
        <div class="w-1/6">
          Count: {{slot.successfulBidsCount}}
        </div>
        <div class="w-1/6">
          Count: {{slot.failedBidsCount}}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {EpochChain, EpochContract} from '@aeternity/aepp-sdk';
  import Util from '../../utils/blockchain_util';
  import Countdown from '@/components/Countdown'

  export default {
    name: 'Canvas',
    components: {Countdown},
    data() {
      return {
        slots: [],
        height: 0,
        avgBlockTime: 3 * 60
      }
    },
    async created() {


      const client = await EpochChain.compose(EpochContract)({
        url: `https://ae-art-testnet.piwo.app`,
        internalUrl: `https://ae-art-testnet.piwo.app`,
      }).catch(console.error);

      this.height = await client.height();

      const called = await client.contractEpochCall(this.$store.state.blockchainSettings.contractAddress, 'sophia-address', 'all_auction_slots', '()').catch(console.error);
      const decoded = await client.contractEpochDecodeData(Util.auctionSlotListType, called.out).catch(console.error);
      this.slots = Util.auctionSlotListToObject(decoded)
        .sort((a, b) => a.endBlockHeight - b.endBlockHeight)
        .map(slot => {

          return {
            id: slot.id,
            timeCapacity: slot.timeCapacity,
            minimumTimePerBid: slot.minimumTimePerBid,
            maximumTimePerBid: slot.maximumTimePerBid,
            startBlockHeight: slot.startBlockHeight,
            endBlockHeight: slot.endBlockHeight,
            successfulBidsCount: slot.successfulBids.length,
            failedBidsCount: slot.failedBids.length,
          }
        });
    }
  }
</script>

<style scoped>
  .slot-row {
    padding: 10px;
    border-top: 1px solid lightgray;
  }
</style>
