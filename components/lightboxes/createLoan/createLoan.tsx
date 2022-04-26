import React, { useContext, useEffect, useState } from 'react'
import { observer } from 'mobx-react'
import { toast } from 'react-toastify'
import { Form, Field } from 'react-final-form'
import { StoreContext } from '@pages/_app'
import { SubOfferInterface } from '@stores/LoanActionStore'
import { calculateRepayValue } from '@utils/calculateRepayValue'
import { BlobLoader } from '@components/layout/blobLoader'
import getDecimalsForLoanAmount from '@integration/getDecimalForLoanAmount'
import { currencyMints } from '@constants/currency'

interface CreateLoanProps {
  mode: 'new' | 'update'
}

export const CreateLoan: React.FC<CreateLoanProps> = observer(({ mode }) => {
  const store = useContext(StoreContext)
  const { connected, wallet, walletKey } = store.Wallet
  const { activeSubOffer, activeSubOfferData } = store.Lightbox

  const [processing, setProcessing] = useState(false)

  const onSubmit = async (values: SubOfferInterface) => {
    if (connected && wallet && walletKey) {
      if (mode === 'new') {
        try {
          if (store.Lightbox.content === 'loanCreate' && store.MyOffers.activeNftMint) {
            const { loanvalue, currency, duration, apr } = values
            store.Lightbox.setCanClose(false)
            setProcessing(true)

            await store.MyOffers.handleCreateSubOffer(
              store.MyOffers.activeNftMint,
              Number(loanvalue),
              Number(duration),
              Number(apr),
              currency
            )
            store.Lightbox.setVisible(false)
            store.Lightbox.setCanClose(true)
            setProcessing(false)
            toast.success(`Loan Offer Created`, {
              autoClose: 3000,
              position: 'top-center',
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            })
          }
        } catch (e: any) {
          if (e.message === 'User rejected the request.') {
            toast.error(`Transaction rejected`, {
              autoClose: 3000,
              position: 'top-center',
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            })
          } else {
            toast.error(`Something went wrong`, {
              autoClose: 3000,
              position: 'top-center',
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            })
          }
          console.log(e)
        } finally {
          store.Lightbox.setVisible(false)
          store.Lightbox.setCanClose(true)
          await store.MyOffers.refetchStoreData()
        }
      } else if (mode === 'update') {
        const { loanvalue, duration, apr } = values
        store.Lightbox.setCanClose(false)
        setProcessing(true)
        try {
          await store.MyOffers.handleEditSubOffer(
            Number(loanvalue),
            Number(duration),
            Number(apr),
            Number(activeSubOfferData.minRepaidNumerator),
            activeSubOffer
          )
          setProcessing(false)
          toast.success(`Changes Saved`, {
            autoClose: 3000,
            position: 'top-center',
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined
          })
        } catch (e: any) {
          if (e.message === 'User rejected the request.') {
            toast.error(`Transaction rejected`, {
              autoClose: 3000,
              position: 'top-center',
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            })
          } else {
            toast.error(`Something went wrong`, {
              autoClose: 3000,
              position: 'top-center',
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined
            })
          }
          console.log(e)
        } finally {
          store.Lightbox.setVisible(false)
          store.Lightbox.setCanClose(true)
          await store.MyOffers.refetchStoreData()
        }
      }
    }
  }

  return processing ? (
    <div className='create-offer-processing'>
      <BlobLoader />
      <span>Processing Transaction</span>
    </div>
  ) : (
    <Form
      className='create-offer-container'
      onSubmit={onSubmit}
      render={({ handleSubmit, submitting, pristine, values }) => (
        <form className='create-offer' onSubmit={handleSubmit}>
          <h1>{mode === 'new' ? `Create Loan Offer` : `Update Loan Offer`}</h1>
          <div className='offer-form'>
            <div className='form-line form-amount'>
              <div>
                <span>Amount</span>
                <Field
                  component='input'
                  type='number'
                  name='loanvalue'
                  min={1}
                  placeholder='Amount'
                  className='input-text'
                  initialValue={
                    mode === 'update' && activeSubOfferData
                      ? +getDecimalsForLoanAmount(activeSubOfferData.offerAmount, activeSubOfferData.offerMint)
                      : 1
                  }
                />
              </div>
              <div>
                <span>Currency</span>
                <Field
                  name='currency'
                  component='select'
                  initialValue={
                    mode === 'update' && activeSubOfferData ? currencyMints[activeSubOfferData.offerMint] : 'USDC'
                  }
                  disabled={mode === 'update'}
                >
                  <option value='USDC' key='USDC'>
                    USDC
                  </option>
                  <option value='SOL' key='SOL'>
                    SOL
                  </option>
                </Field>
              </div>
            </div>
            <div className='form-line form-duration'>
              <div>
                <span>Duration</span>
                <Field
                  component='input'
                  name='duration'
                  type='range'
                  min={1}
                  max={90}
                  initialValue={
                    mode === 'update' && activeSubOfferData
                      ? Number(activeSubOfferData.loanDuration.toString()) / 60 / 60 / 24
                      : 1
                  }
                />
              </div>
              <div>
                <span></span>
                <Field
                  component='input'
                  name='duration'
                  type='number'
                  min={1}
                  max={90}
                  className='input-text'
                  initialValue={
                    mode === 'update' && activeSubOfferData
                      ? Number(activeSubOfferData.loanDuration.toString()) / 60 / 60 / 24
                      : 1
                  }
                />
              </div>
            </div>
            <div className='form-line form-APR'>
              <div>
                <span>APR (%)</span>
                <Field
                  type='number'
                  name='apr'
                  min={1}
                  component='input'
                  initialValue={mode === 'update' && activeSubOfferData ? activeSubOfferData.aprNumerator : 500}
                  className='input-text'
                />
              </div>
              <div>
                {calculateRepayValue(Number(values.loanvalue), Number(values.apr), Number(values.duration))}
                <span> {values && values.currency ? values.currency.toUpperCase() : ''}</span>
              </div>
            </div>
            <button type='submit' className='btn-content' disabled={submitting || pristine}>
              <i className='icon icon--nft'></i>
              {mode === 'new' ? `Create` : `Save Changes`}
            </button>
          </div>
        </form>
      )}
    />
  )
})
