import { PublicKey } from '@solana/web3.js'

export const config = {
  devnet: true,
  devnetEndpoint: 'https://api.devnet.solana.com',
  mainnetEndpoint: 'https://solana-api.projectserum.com',
  pagiPrev: 2,
  pagiNext: 2,
  nftBulkMax: 20,
  loanValueMin: 1,
  loanAPRMin: 1,
  loanMinRepayMin: 1
}

export const NFT_LOAN_PID = new PublicKey(
  config.devnet ? '4MwL9T4Kjyq8KuVbJM5hpfQizTKFbZmg7aqBQP9zapBJ ' : 'H87mP39hQqZvh3GESPCAV426Gp3vJcraz1YgtU21i5RV'
)

export const RPC_ENDPOINT = config.devnet ? config.devnetEndpoint : config.mainnetEndpoint
