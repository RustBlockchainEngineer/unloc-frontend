import React from 'react'
import { BN } from '@project-serum/anchor'
import { compressAddress } from '@utils/stringUtils/compressAdress'
import { PublicKey } from '@solana/web3.js'
import { IsubOfferData } from '@stores/Lightbox.store'
import { currencyMints } from '@constants/currency'
import { getDecimalsForLoanAmountAsString } from '@integration/getDecimalForLoanAmount'
import { ClipboardButton } from '@components/layout/clipboardButton'
import { ShowOnHover } from '@components/layout/showOnHover'
import { SolscanExplorerIcon } from '@components/layout/solscanExplorerIcon'

interface MyOffersNftOfferItemProps {
  offerAmount: any
  offerID: PublicKey
  status: string
  APR: string
  duration: BN
  repaid: string
  offerMint: PublicKey
  handleOfferEdit: (subOfferKey: string, values: IsubOfferData) => Promise<void>
  handleOfferCancel: (subOfferKey: string) => Promise<void>
  classNames?: string
  nftMint: string
  disabled: boolean
}

export const MyOffersNftOfferItem: React.FC<MyOffersNftOfferItemProps> = ({
  offerAmount,
  offerID,
  status,
  APR,
  duration,
  repaid,
  offerMint,
  handleOfferEdit,
  handleOfferCancel,
  classNames,
  nftMint,
  disabled
}) => {
  const setStatus = (status: string) => {
    if (status === '0' || status === '6') {
      return <p className={'suboffer-containers__status'}>Proposed</p>
    }
  }

  let offerClassNames = (classNames ? classNames : '') + ' ' + (disabled ? 'disabled' : '')

  const stopOnClickPropagation = (e: React.MouseEvent<HTMLElement>) => {
    e.stopPropagation()
  }

  return (
    <div className={`my-offers-nft__offer ${offerClassNames}`} onClick={(e) => stopOnClickPropagation(e)}>

      <div className='offer__row'>
        <div className='offer__row--item'>
          <h4>Collateral ID</h4>
          <ShowOnHover label={compressAddress(4, offerID.toString())} classNames='suboffer-containers__id'>
            <ClipboardButton data={offerID.toString()} />
            <SolscanExplorerIcon type={'token'} address={offerID.toString()} />
          </ShowOnHover>
        </div>
        <div className='offer__row--item'>
          <h4>Status</h4>
          {setStatus(status.toString())}
        </div>
        <div className='offer__row--item'>
          <h4>MFT Mint</h4>
          <ShowOnHover label={compressAddress(4, nftMint)} classNames='suboffer-containers__mint'>
            <ClipboardButton data={nftMint} />
            <SolscanExplorerIcon type={'token'} address={nftMint} />
          </ShowOnHover>
        </div>
      </div>

      <div className='offer__row details'>
        <div className='offer__row--item'>
          <h4>Amount</h4>
          <p>{`${getDecimalsForLoanAmountAsString(offerAmount.toNumber(), offerMint.toString(), 2)} ${
            currencyMints[offerMint.toBase58()]
          }`}</p>
        </div>

        <div className='offer__row--item'>
          <h4>APR</h4>
          <p>{APR.toString()}%</p>
        </div>
        <div className='offer__row--item'>
          <h4>{status.toString() == '1' ? 'Time left' : 'Duration'}  </h4>
          <p>{Number(duration.toString()) / 60 / 60 / 24} Days</p>
        </div>
        {/* <div className='offer__row--item'>
          <h4>Min repaid value</h4>
          <p>{repaid.toString()}</p>
        </div> */}
      </div>

      <div className='offer__row'>
        <button className='btn btn--md btn--bordered' onClick={() => handleOfferCancel(offerID.toBase58())}>
          Cancel Offer
        </button>
        <button
          className='btn btn--md btn--primary'
          onClick={() =>
            handleOfferEdit(offerID.toBase58(), {
              offerAmount: Number(offerAmount),
              loanDuration: Number(duration),
              aprNumerator: Number(APR),
              minRepaidNumerator: Number(repaid),
              offerMint: offerMint.toBase58()
            })
          }
        >
          Edit Offer
        </button>
      </div>

    </div>
  )
}
