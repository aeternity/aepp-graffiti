<template>
  <div>
    <h1>Drone Graffiti Teaser</h1>
    <div v-for="teaser in teaserData">
      <a target="_blank"
         :href="`https://testnet.explorer.aepps.com/#/tx/${teaser.transaction}`">{{teaser.transaction}}</a><br/>
    </div>
  </div>
</template>

<script>
  import axios from 'axios'

  export default {
    name: 'Admin',
    components: {},
    data() {
      return {
        // TODO change to mainnet as well as in href
        mainnetUrl: "https://sdk-testnet.aepps.com",

        // TODO: real contract hash
        teaserContract: "ct_2P2vEqq3WQz6kzKLJFoqBbm46EMot64WvpP1xpvvANApLWcwnt",

        // TODO: teaserData from contract
        teaserData: [{
          id: 1,
          updatedAt: 34955,
          artworkReference: "QmUXh2fDRJu5PP8wWvtU55VPCeruzFJpbBqWPFBPAKKEXh",
          transaction: null
        }],
      }
    },
    computed: {},
    methods: {
      async transactionHash(height) {
        const block = await axios.get(`${this.mainnetUrl}/v2/generations/height/${height}`)
          .then(x => x.data);
        const microblocks = await Promise.all(
          block.micro_blocks
            .map(microblock => axios.get(`${this.mainnetUrl}/v2/micro-blocks/hash/${microblock}/transactions`)
              .then(x => x.data))
        );
        return microblocks
          .reduce((acc, val) => acc.concat(val.transactions), [])
          .filter(t => t.tx.contract_id && t.tx.contract_id === this.teaserContract)
          .map(t => t.hash)[0];
      }
    },
    async created() {
      this.teaserData = await Promise.all(this.teaserData.map(async teaser => {
        teaser.transaction = await this.transactionHash(teaser.updatedAt);
        return teaser;
      }))
    }
  }
</script>

<style lang="scss" scoped>

</style>
