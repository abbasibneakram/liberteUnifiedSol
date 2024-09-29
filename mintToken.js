const web3 = require('@solana/web3.js')
const bs58 = require('bs58')
const {
    mintTo,
    getOrCreateAssociatedTokenAccount,
} = require('@solana/spl-token')

const wallet = web3.Keypair.fromSecretKey(
    new Uint8Array(bs58.default.decode(process.env.PHANTOM_PRIVATE_KEY))
)
// console.log("wallet",wallet);
const mint = new web3.PublicKey('ZxpD7QQcYnpU1uqF1hKYui4o52xqVXRZDfGrZNGdAFu')
let main = async () => {
    const connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed'
    )
    const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        wallet,
        mint,
        wallet.publicKey
    )

    console.log('Token Minting...')

    const tokensToMint = 5000 * 10 ** 9
    let tx = await mintTo(
        connection,
        wallet,
        mint,
        toTokenAccount.address,
        wallet,
        tokensToMint
    )
    console.log(`${tokensToMint / 10 ** 9} Tokens Minted to: ${
        wallet.publicKey
    } 
        Transaction Hass: ${tx}`)
}
main()
