const { createMint } = require('@solana/spl-token')
const web3 = require('@solana/web3.js')
const bs58 = require('bs58')
const secret = require('./guideSecret.json')

const wallet = web3.Keypair.fromSecretKey(new Uint8Array(secret))

console.log(wallet.publicKey)

console.log('Creating token mint...')

async function main() {
    const connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed'
    )

    const token = await createMint(
        connection,
        wallet, // the fee payer
        wallet.publicKey, // the mint authority
        wallet.publicKey, // the freeze authority
        9 // the decimals used, we use 9 because it's the default and recommended value
    )

    console.log(`Created Token Mint Address: ${token.toBase58()}`)
}
main()
