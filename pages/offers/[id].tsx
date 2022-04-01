import { observer } from 'mobx-react-lite'
import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { PublicKey } from '@solana/web3.js'
import React, { useContext, useEffect, useState } from 'react'
import { LayoutTop } from '../../components/layout/layoutTop'
import Header from '../../components/singleOffer/Header/Header'
import Offer from '../../components/singleOffer/Offer/Offer'
import { StoreDataAdapter } from '../../components/storeDataAdapter'
import { getQueryParamAsString } from '../../utils/getQueryParamsAsString'
import { secondsToDays } from '../../utils/mathUtils.ts/durationCalc'
import { compressAddress } from '../../utils/stringUtils/compressAdress'
import { StoreContext } from '../_app'

interface IOffer {
  amount: string
  apr: number
  currency: string
  duration: number
  id: string
  offerMint: string
  publicKey: PublicKey
}

const MyOffers: NextPage = observer(({}) => {
  const router = useRouter()
  const store = useContext(StoreContext)

  const [loaded, setLoaded] = useState(false)
  const [message, setMessage] = useState<string>('')
  const { connected, wallet } = store.Wallet
  const { nftData, loansData } = store.SingleOffer

  console.log(nftData)
  const handleData = async () => {
    try {
      setLoaded(false)
      if (connected && wallet && router.query.id) {
        // albo connect albo wallet nie pozwala na ściąganie danych z integracji
        setMessage(getMessage())
        // await store.SingleOffer.fetchNft(getQueryParamAsString(router.query.id))
        setLoaded(true)
        await store.SingleOffer.fetchSubOffers(getQueryParamAsString(router.query.id))
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e)
    }
  }

  const getMessage = () => {
    if (!connected) {
      return 'Please connect wallet'
    }
    return 'Lend Money'
  }

  useEffect(() => {
    handleData()
  }, [router.query.id, connected, wallet])
  return (
    <StoreDataAdapter>
      <div className='page my-offers'>
        <LayoutTop />
        <Header
          collectionName='test'
          nftAddress='4G7tnw4nFy1zK8KW77HJyDn4tTU4vFcwQJF3FF9ek5Rj'
          nftImage='test'
          nftName='test'
          website='unloc.xyz'
        />
        <div className='offer-grid'>
          {loansData.map((offer: IOffer) => {
            console.log(offer)
            return (
              <Offer
                key={offer.id}
                offerID={compressAddress(4, offer.id)}
                status='Active'
                amount={offer.amount}
                token='USDC'
                duration={secondsToDays(offer.duration).toString()}
                durationRemaning='20' // do zrobienia, w obiekcie nie ma info odnośnie rozpoczęcia stworzenia oferty
                APR={offer.apr}
                totalReapy='10293' // do zrobienia, pewnie to bedzie liczone po APR
                btnMessage={message}
              />
            )
          })}
        </div>
      </div>
      <div className='home-bg-bottom' />
    </StoreDataAdapter>
  )
})

export default MyOffers
