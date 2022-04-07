import React, { useContext, useState } from 'react'
import { observer } from 'mobx-react'
import { toast } from 'react-toastify'

import { Form, Field } from 'react-final-form'
import { StoreContext } from '../../../pages/_app'
import { SubOfferInterface } from '../../../stores/LoanActionStore'
import { calculateRepayValue } from '../../../methods/calculateRepayValue'
import { BlobLoader } from '../../layout/blobLoader'

interface CreateLoanProps {
  mode: 'new' | 'update'
}

export const CreateLoan: React.FC<CreateLoanProps> = observer((mode) => {
  const store = useContext(StoreContext)
  const { connected, wallet, walletKey } = store.Wallet

  const [processing, setProcessing] = useState(false)

  const onSubmit = async (values: SubOfferInterface) => {
    if (connected && wallet && walletKey) {
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
        }
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
        await store.MyOffers.refetchStoreData()
      } catch (e) {
        console.log(e)
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
          <h1>Create Loan Offer</h1>
          <div className='offer-form'>
            <div className='form-line form-amount'>
              <div>
                <span>Amount</span>
                <Field
                  component='input'
                  type='number'
                  initialValue={1}
                  name='loanvalue'
                  placeholder='Amount'
                  className='input-text'
                />
              </div>
              <div>
                <span>Currency</span>
                <Field name='currency' initialValue='USDC' component='select'>
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
                <Field component='input' name='duration' type='range' initialValue={1} min={1} max={90} />
              </div>
              <div>
                <span></span>
                <Field
                  component='input'
                  name='duration'
                  type='number'
                  initialValue={1}
                  min={1}
                  max={90}
                  className='input-text'
                />
              </div>
            </div>
            <div className='form-line form-APR'>
              <div>
                <span>APR (%)</span>
                <Field type='number' name='apr' component='input' initialValue={500} className='input-text' />
              </div>
              <div>
                {calculateRepayValue(Number(values.loanvalue), Number(values.apr), Number(values.duration))}
                <span> {values && values.currency ? values.currency.toUpperCase() : ''}</span>
              </div>
            </div>
            <button type='submit' className='btn-content' disabled={submitting || pristine}>
              <i className='icon icon--nft'></i>
              Create
            </button>
          </div>
        </form>
      )}
    />
  )
})
