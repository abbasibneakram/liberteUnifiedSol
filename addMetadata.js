const web3 = require('@solana/web3.js')
const {
    createCreateMetadataAccountV3Instruction,
} = require('@metaplex-foundation/mpl-token-metadata')
const bs58 = require('bs58')

// Define the Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

// Example token mint account public key (replace with your actual mint address)
const tokenMintAccount = new web3.PublicKey(
    'DsVSzp9MDvEGj61W8xuUZvJS34N78PBM9UC9tPfYbqN8'
)

// Function to create a metadata account
const createMetadataAccount = async (
    metadataPDA,
    mint,
    payer,
    metadataData
) => {
    const tx = new web3.Transaction().add(
        createCreateMetadataAccountV3Instruction(
            {
                metadata: metadataPDA,
                mint: mint,
                mintAuthority: payer.publicKey,
                payer: payer.publicKey,
                updateAuthority: payer.publicKey,
            },
            {
                createMetadataAccountArgsV3: {
                    data: metadataData,
                    isMutable: true,
                    collectionDetails: null,
                },
            }
        )
    )
    return tx
}

// Function to find the PDA (Program Derived Address) for the metadata account
const getMetadata = async (mint) => {
    return (
        await web3.PublicKey.findProgramAddress(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mint.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        )
    )[0]
}

// Metadata for the token
const metadataData = {
    name: 'Liberte Unified Dollar Test',
    symbol: 'LUDT',
    uri: 'https://ipfs.io/ipfs/QmdfXgdxZTv1ax3rH2zwVmR7Lf8oAR19yVxpHGJUS3oiaB', // Link to JSON metadata file
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
}

// Create wallet from Phantom private key
const wallet = web3.Keypair.fromSecretKey(
    new Uint8Array(bs58.default.decode(process.env.PHANTOM_PRIVATE_KEY))
)

// Main function to add metadata to the existing token mint
const addMetadata = async (mintAddress, connection) => {
    // Get the metadata account PDA
    const metadataAccount = await getMetadata(mintAddress)

    // Create the metadata account transaction
    const tx = await createMetadataAccount(
        metadataAccount,
        mintAddress,
        wallet, // Use the wallet directly
        metadataData
    )

    // Send and confirm the transaction
    const transactionId = await web3.sendAndConfirmTransaction(connection, tx, [
        wallet,
    ])
    console.log('Metadata Added to Token, Transaction ID:', transactionId)
}

// Example usage
;(async () => {
    const connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed'
    )

    const mintAddress = new web3.PublicKey(
        'ZxpD7QQcYnpU1uqF1hKYui4o52xqVXRZDfGrZNGdAFu'
    )

    await addMetadata(mintAddress, connection)
})()
