const web3 = require('@solana/web3.js')
const {
    createCreateMetadataAccountV3Instruction,
} = require('@metaplex-foundation/mpl-token-metadata')
const bs58 = require('bs58')
const secret = require('./guideSecret.json')

// Define the Token Metadata Program ID
const TOKEN_METADATA_PROGRAM_ID = new web3.PublicKey(
    'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'
)

// Wallet from Phantom private key
const wallet = web3.Keypair.fromSecretKey(new Uint8Array(secret))

// Function to find the PDA (Program Derived Address) for the metadata account
const getMetadata = async (mint) => {
    const [metadataPDA] = await web3.PublicKey.findProgramAddress(
        [
            Buffer.from('metadata'),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
    )
    return metadataPDA
}

// Metadata for the token
const metadataData = {
    name: 'Liberte Unified Dollar Test',
    symbol: 'LUDT',
    uri: 'https://ipfs.io/ipfs/QmZMJ2XN7BgTC9pvboggk6Y9f5DxJapPYUTQhFfezwMadg', // Link to JSON metadata file
    sellerFeeBasisPoints: 0,
    creators: null,
    collection: null,
    uses: null,
}

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

// Function to check if metadata already exists
const checkMetadataExists = async (connection, metadataPDA) => {
    const metadataInfo = await connection.getAccountInfo(metadataPDA)
    if (metadataInfo) {
        console.log('Metadata already exists for this mint.')
        return true
    }
    return false
}

// Main function to add metadata to the existing token mint
const addMetadata = async (mintAddress, connection) => {
    try {
        console.log('Fetching metadata PDA...')
        const metadataAccount = await getMetadata(mintAddress)

        console.log('Checking if metadata already exists...')
        const exists = await checkMetadataExists(connection, metadataAccount)
        if (exists) {
            console.log('Aborting: Metadata already exists.')
            return
        }

        console.log('Creating metadata account transaction...')
        const tx = await createMetadataAccount(
            metadataAccount,
            mintAddress,
            wallet,
            metadataData
        )

        console.log('Sending transaction...')
        const transactionId = await web3.sendAndConfirmTransaction(
            connection,
            tx,
            [wallet]
        )
        console.log(
            'Metadata added successfully. Transaction ID:',
            transactionId
        )
    } catch (err) {
        console.error('Error adding metadata:', err)
    }
}

// Example usage
;(async () => {
    const connection = new web3.Connection(
        web3.clusterApiUrl('devnet'),
        'confirmed'
    )

    const mintAddress = new web3.PublicKey(
        'HTxpgCMT1K4NAbXyS6gyBTQbwZHbzsRutmqyZBV5xpPY' // Replace with your token mint address
    )

    console.log('Starting metadata addition process...')
    await addMetadata(mintAddress, connection)
})()
