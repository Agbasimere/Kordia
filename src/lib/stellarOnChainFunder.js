import * as StellarSdk from '@stellar/stellar-sdk';

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const USDC_ISSUER = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const USDC_ASSET = new StellarSdk.Asset('USDC', USDC_ISSUER);

/**
 * Real On-Chain Testnet USDC Dispenser
 * 1. Generates ephemeral funder keypair
 * 2. Funds with 10,000 XLM via Friendbot
 * 3. Establishes USDC trustline
 * 4. Swaps XLM for real Circle Testnet USDC on testnet DEX
 * 5. Sends USDC directly to target Stellar address on Horizon
 */
export async function fundStellarAccountWithRealUsdc(targetAddress, amount = '1000') {
  if (!targetAddress || targetAddress.length !== 56 || !targetAddress.startsWith('G')) {
    throw new Error('Invalid 56-character Stellar public key');
  }

  const amountStr = parseFloat(amount).toFixed(7).replace(/\.?0+$/, '') || '1000';

  // 1. Ensure target has XLM if needed
  try {
    const accCheck = await fetch(`https://horizon-testnet.stellar.org/accounts/${targetAddress}`);
    if (accCheck.ok) {
      const data = await accCheck.json();
      const nativeBal = data.balances?.find(b => b.asset_type === 'native');
      if (!nativeBal || parseFloat(nativeBal.balance) < 1) {
        // Top up target account with 10,000 XLM
        await fetch(`https://horizon-testnet.stellar.org/friendbot?addr=${targetAddress}`);
      }
    } else if (accCheck.status === 404) {
      await fetch(`https://horizon-testnet.stellar.org/friendbot?addr=${targetAddress}`);
    }
  } catch (e) {
    console.warn('[Funder XLM Check]', e);
  }

  // 2. Ephemeral funder keypair
  const funderKey = StellarSdk.Keypair.random();
  const fbRes = await fetch(`https://horizon-testnet.stellar.org/friendbot?addr=${funderKey.publicKey()}`);
  if (!fbRes.ok) {
    throw new Error('Testnet Friendbot busy, please try again in a moment');
  }

  // 3. Load funder and add trustline
  let funderAccount = await server.loadAccount(funderKey.publicKey());
  const trustTx = new StellarSdk.TransactionBuilder(funderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.changeTrust({
        asset: USDC_ASSET,
        limit: '10000000'
      })
    )
    .setTimeout(30)
    .build();

  trustTx.sign(funderKey);
  await server.submitTransaction(trustTx);

  // 4. Swap XLM for USDC on testnet DEX
  funderAccount = await server.loadAccount(funderKey.publicKey());
  const swapTx = new StellarSdk.TransactionBuilder(funderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.pathPaymentStrictReceive({
        sendAsset: StellarSdk.Asset.native(),
        sendMax: '8500',
        destination: funderKey.publicKey(),
        destAsset: USDC_ASSET,
        destAmount: amountStr
      })
    )
    .setTimeout(30)
    .build();

  swapTx.sign(funderKey);
  await server.submitTransaction(swapTx);

  // 5. Transfer USDC to target address
  funderAccount = await server.loadAccount(funderKey.publicKey());
  const payTx = new StellarSdk.TransactionBuilder(funderAccount, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET
  })
    .addOperation(
      StellarSdk.Operation.payment({
        destination: targetAddress,
        asset: USDC_ASSET,
        amount: amountStr
      })
    )
    .setTimeout(30)
    .build();

  payTx.sign(funderKey);
  const payRes = await server.submitTransaction(payTx);

  return {
    success: true,
    tx_hash: payRes.hash,
    amount: amountStr,
    asset: 'USDC',
    target: targetAddress,
    explorer_url: `https://stellar.expert/explorer/testnet/tx/${payRes.hash}`
  };
}
