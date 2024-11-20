const { Keypair, LAMPORTS_PER_SOL, Connection } = require('@solana/web3.js')
const fs = require('fs')
const bs58 = require('bs58')
const dotenv = require('dotenv')

//STEP 1 - Connect to Solana Network
const endpoint =
    'https://solana-devnet.g.alchemy.com/v2/hj6YvuqEX8zop2Wtjnh3A4rXdpT-C0j9' //Replace with your QuickNode RPC Endpoint
const solanaConnection = new Connection(endpoint)

dotenv.config()

// Get Phantom wallet's private key from .env
const phantomPrivateKey = process.env.PHANTOM_PRIVATE_KEY
console.log(phantomPrivateKey, 'phantomPrivateKey')

if (!phantomPrivateKey) {
    throw new Error('Phantom private key not found in .env')
}

// Decode the base58 encoded private key
const privateKeyArray = bs58.default.decode(phantomPrivateKey)
const keyPair = Keypair.fromSecretKey(privateKeyArray)

//STEP 2 - Generate a New Solana Wallet
console.log(
    `Generated new KeyPair. Wallet PublicKey: `,
    keyPair.publicKey.toString()
)

//STEP 3 - Convert Private key to Base58
const privateKey = bs58.default.encode(keyPair.secretKey)
console.log(`Wallet PrivateKey:`, privateKey)

//STEP 4 - Write Wallet Secret Key to a .JSON
const secret_array = keyPair.secretKey
    .toString() //convert secret key to string
    .split(',') //delimit string by commas and convert to an array of strings
    .map((value) => Number(value)) //convert string values to numbers inside the array

const secret = JSON.stringify(secret_array) //Covert to JSON string

fs.writeFile('guideSecret.json', secret, 'utf8', function (err) {
    if (err) throw err
    console.log('Wrote secret key to guideSecret.json.')
})

//STEP 5 - Airdrop 1 SOL to new wallet
;(async () => {
    const airdropSignature = solanaConnection.requestAirdrop(
        keyPair.publicKey,
        LAMPORTS_PER_SOL
    )
    try {
        const txId = await airdropSignature
        console.log(`Airdrop Transaction Id: ${txId}`)
        console.log(`https://explorer.solana.com/tx/${txId}?cluster=devnet`)
    } catch (err) {
        console.log(err)
    }
})()
