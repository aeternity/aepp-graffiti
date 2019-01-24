<template>
  <div>
    <ae-loader v-if="loading"/>
    <div v-if="!loading">
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
      <div v-for="slot in slots" :key="slot.id">
        <div class="flex slot-row">
          <div class="w-1/6">
            {{slot.id}}
            <ae-badge v-if="slot.timing.active" class="active-badge">active</ae-badge>
            <ae-badge v-if="slot.timing.past">past</ae-badge>
            <ae-badge v-if="slot.timing.future">future</ae-badge>
            <br>
            <ae-button v-if="slot.timing.past" face="icon" fill="primary">
              <a :href="slot.downloadLink">
                <ae-icon name="save"/>
              </a>
            </ae-button>
          </div>
          <div class="w-1/6">{{slot.capacityUsed}} used of {{slot.timeCapacity}}</div>
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
            Count: {{slot.success.bids.length}}<br>
            Total: {{slot.success.amountSum}} AE<br>
            <div v-if="slot.success.bids.length">
              Min: {{Math.min(...slot.success.amountPerTime)}} AE/Min<br>
              Max: {{Math.max(...slot.success.amountPerTime)}} AE/Min
            </div>
          </div>
          <div class="w-1/6">
            Count: {{slot.failed.bids.length}}<br>
            Total: {{slot.failed.amountSum}} AE<br>
            <div v-if="slot.failed.bids.length">
              Min: {{Math.min(...slot.failed.amountPerTime)}} AE/Min<br>
              Max: {{Math.max(...slot.failed.amountPerTime)}} AE/Min
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import {EpochChain, EpochContract} from '@aeternity/aepp-sdk';
  import Util from '@/utils/blockchain_util';
  import Countdown from '@/components/Countdown';
  import {AeBadge, AeLoader, AeButton, AeIcon} from '@aeternity/aepp-components'

  export default {
    name: 'Canvas',
    components: {AeLoader, AeBadge, AeButton, AeIcon, Countdown},
    data() {
      return {
        slots: [],
        height: 0,
        avgBlockTime: 3 * 60,
        loading: true
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
            downloadLink: `${this.$store.state.apiUrl}/slots/${slot.id}`,
            timing: {
              past: slot.startBlockHeight < this.height && slot.endBlockHeight <= this.height,
              active: slot.startBlockHeight < this.height && slot.endBlockHeight > this.height,
              future: slot.startBlockHeight >= this.height && slot.endBlockHeight > this.height
            },
            timeCapacity: slot.timeCapacity,
            minimumTimePerBid: slot.minimumTimePerBid,
            maximumTimePerBid: slot.maximumTimePerBid,
            startBlockHeight: slot.startBlockHeight,
            endBlockHeight: slot.endBlockHeight,
            capacityUsed: slot.successfulBids.reduce((acc, x) => Number(x.time) + acc, 0),
            success: {
              bids: slot.successfulBids,
              amountSum: Util.atomsToAe(slot.successfulBids.reduce((acc, x) => Number(x.amount) + acc, 0)),
              amountPerTime: slot.successfulBids.map(x => Number(x.amountPerTime)).map(x => Util.atomsToAe(x).toFixed(4))
            },
            failed: {
              bids: slot.failedBids,
              amountSum: Util.atomsToAe(slot.failedBids.reduce((acc, x) => Number(x.amount) + acc, 0)),
              amountPerTime: slot.failedBids.map(x => Number(x.amountPerTime)).map(x => Util.atomsToAe(x).toFixed(4))
            },

          }
        });
      this.loading = false;
    }
  }
</script>

<style lang="scss" scoped>
  @import "~@aeternity/aepp-components/src/styles/variables/colors.scss";

  a {
    color: $color-neutral-minimum;
    text-decoration: none;
  }

  .slot-row {
    padding: 10px;
    border-top: 1px solid lightgray;
  }

  .active-badge {
    background-color: $color-primary;
  }
</style>
