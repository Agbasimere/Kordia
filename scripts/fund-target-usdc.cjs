const StellarSdk = require('@stellar/stellar-sdk');

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_ASSET = new StellarSdk.Asset('USDC', USDC_ISSUER);
const TARGET_ACCOUNT = process.argv[2] || 'GCDSPGQX2LK5LPVYW6J3VCOCTARG3YPWJJ2XPNASDRTDMZM7ZGCNPYKB';
const AMOUNT_TO_SEND = process.argv[3] || '1000';

async function main() {
  console.log(`Target account: ${TARGET_ACCOUNT}`);
  console.log(`Desired USDC amount: ${AMOUNT_TO_SEND}`);

  // 1. Generate funder keypair
  const funderKey = StellarSdk.Keypair.random();
  console.log(`Funder pubkey: ${funderKey.publicKey()}`);

  // 2. Fund with Friendbot
  console.log('Funding with Friendbot...');
  const fbRes = await fetch(`https://horizon-testnet.stellar.org/friendbot?addr=${funderKey.publicKey()}`);
  if (!fbRes.ok) {
    throw new Error('Friendbot funding failed: ' + (await fbRes.text()));
  }
  console.log('Friendbot funded 10,000 XLM!');

  // 3. Load account
  let funderAccount = await server.loadAccount(funderKey.publicKey());

  // 4. Add trustline to USDC
  console.log('Adding trustline to Circle testnet USDC...');
  let tx = new StellarSdk.TransactionBuilder(funderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: USDC_ASSET,
        limit: '1000000'
      })
    )
    .setTimeout(30)
    .build();

  tx.sign(funderKey);
  let res = await server.submitTransaction(tx);
  console.log('Trustline established! Tx hash:', res.hash);

  // 5. Swap XLM for USDC on testnet DEX
  console.log('Swapping XLM for USDC on testnet DEX...');
  funderAccount = await server.loadAccount(funderKey.publicKey());

  // Path payment strict receive: funder sends max 8000 XLM to receive AMOUNT_TO_SEND USDC
  // Or manage buy offer
  const buyOfferTx = new StellarSdk.TransactionBuilder(funderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset: StellarSdk.Asset.native(),
        sendMax: '8000',
        destination: funderKey.publicKey(),
        destAsset: USDC_ASSET,
        destAmount: AMOUNT_TO_SEND
      })
    )
    .setTimeout(30)
    .build();

  buyOfferTx.sign(funderKey);
  res = await server.submitTransaction(buyOfferTx);
  console.log(`Swapped XLM -> ${AMOUNT_TO_SEND} USDC! Tx:`, res.hash);

  // 6. Pay USDC to TARGET_ACCOUNT
  console.log(`Sending ${AMOUNT_TO_SEND} USDC to ${TARGET_ACCOUNT}...`);
  funderAccount = await server.loadAccount(funderKey.publicKey());

  const payTx = new StellarSdk.TransactionBuilder(funderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: TARGET_ACCOUNT,
        asset: USDC_ASSET,
        amount: AMOUNT_TO_SEND
      })
    )
    .setTimeout(30)
    .build();

  payTx.sign(funderKey);
  const payRes = await server.submitTransaction(payTx);
  console.log(`SUCCESS! Sent ${AMOUNT_TO_SEND} USDC to ${TARGET_ACCOUNT}!`);
  console.log('Transaction Hash:', payRes.hash);
  console.log(`StellarExpert: https://stellar.expert/explorer/testnet/tx/${payRes.hash}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  if (err.response?.data?.extras?.result_codes) {
    console.error('Result codes:', JSON.stringify(err.response.data.extras.result_codes));
  }
});
