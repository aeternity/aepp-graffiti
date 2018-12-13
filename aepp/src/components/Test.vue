<template>
    
</template>

<script>
  import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'

  export default {
    name: 'Test',
    methods: {
      bidListToObject(bidList) {
        return bidList.value.map(bid => {
          return {
            userHash: bid.value[0].value,
            hash: bid.value[1].value,
            coordinates: {
              x: bid.value[2].value[0].value,
              y: bid.value[2].value[1].value
            },
            droneTime: bid.value[3].value,
            amount: bid.value[4].value
          }
        })
      }
    },
    created() {
      Aepp().then(async ae => {
        console.log('client: ', ae)
        this.client = ae
        ae.address()
          .then(address => {
            this.pub = address
            ae.balance(address).then(balance => {
              // logs current balance of "A_PUB_ADDRESS"
              console.log('balance', balance)
              this.balance = Number(balance);
            })
          })

        /*
        const contractAddress = 'ct_oLQSNByYq6LJDUS4JuHYFu4r72odCXL8pCyu45Ef8ZQweVSXC';
        const calledMyBids = await this.client.contractCall(contractAddress, 'sophia-address', contractAddress, 'all_bids', {args: '()'}).catch(e => console.error(e));
        console.log('calledMyBids', calledMyBids);

        const decodedMyBids = await this.client.contractDecodeData('list((address, string, (int, int), int, int))', calledMyBids.result.returnValue).catch(e => console.error(e));
        console.log('decodedMyBids', decodedMyBids);
        console.log(JSON.stringify(decodedMyBids));
        */

        const decodedBits = JSON.parse(`{"type":"list","value":[{"type":"tuple","value":[{"type":"word","value":"35987526399471973984668950951030893469195020366758262402568746043533020074521"},{"type":"string","value":"4DF3C3F68FCC83B27E9D42C90431A72499F17875C81A599B566C9889B9696703"},{"type":"tuple","value":[{"type":"word","value":3},{"type":"word","value":4}]},{"type":"word","value":10},{"type":"word","value":1337}]}]}`);
        console.log(this.bidListToObject(decodedBits));
      })
    }
  }
</script>

<style scoped>

</style>
