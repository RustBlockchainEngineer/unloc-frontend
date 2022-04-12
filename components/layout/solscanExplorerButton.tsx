import React from 'react'
import Image from 'next/image'
import { config } from '@constants/config'

interface SolscanExplorerButtonProps {
  type: 'account' | 'block' | 'tx' | 'token'
  address: string
  classNames?: string
}

export const SolscanExplorerButton: React.FC<SolscanExplorerButtonProps> = ({
  type,
  address,
  classNames
}: SolscanExplorerButtonProps) => {
  const handleOnClick = () => {
    window
      .open(`https://solscan.io/${type}/${address}?cluster=${config.devnet ? 'devnet' : 'mainnet'}`, '_blank')
      ?.focus()
  }

  return (
    <button
      className={`btn btn--solana-explorer btn--light btn--rounded ${classNames}`}
      onClick={() => handleOnClick()}
    >
      See more on <Image src='/icons/solscan-icon.svg' width={270} height={29} alt='Solscan Explorer' />
    </button>
  )
}
