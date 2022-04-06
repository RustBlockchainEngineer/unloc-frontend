import React, { useContext } from 'react'
import { observer } from 'mobx-react'

import { Form, Field } from 'react-final-form'
import { StoreContext } from '../../../pages/_app'
import { SubOfferInterface } from '../../../stores/LoanActionStore'

interface CreateLoanProps {
  mode: 'new' | 'update'
}

export const CreateLoan: React.FC<CreateLoanProps> = observer((mode) => {
  const store = useContext(StoreContext)
  const { connected, wallet, walletKey } = store.Wallet

  const onSubmit = async (values: SubOfferInterface) => {
    if (connected && wallet && walletKey) {
      try {
        // if (showLightboxLoan === 'create' && offerNftMint) {
        //   await store.LoanActions.handleNewSubOffer(values, offerNftMint)
        // }
        console.log('create new loan')
      } catch (e) {
        console.log(e)
      } finally {
        store.Lightbox.setVisible(false)
      }
    }
  }

  return (
    <Form
      className='create-offer-container'
      initialValues={{
        loanValue: 1,
        currency: 'USDC',
        duration: 1,
        apr: 500
      }}
      onSubmit={onSubmit}
      render={() => (
        <form>
          <h1>Create Loan Offer</h1>
          <div className='offer-form'>
            <div className='form-amount'>
              <div>
                <span>Amount</span>
                <Field name='loanValue' component='input' type='number' placeholder='amount' />
              </div>
              <div>
                <span>Currency</span>
                <Field name='currency' component='select'>
                  <option value='USDC' key='USDC'>
                    USDC
                  </option>
                  <option value='USDT' key='USDT'>
                    USDT
                  </option>
                  <option value='SOL' key='SOL'>
                    SOL
                  </option>
                </Field>
              </div>
            </div>
            <div className='form-duration'>
              <div>
                <span>Duration</span>
                <Field
                  component='input'
                  className='slider-gradient'
                  name='duration'
                  type='range'
                  initialValue={1}
                  min={1}
                  max={90}
                />
              </div>
              <div>
                <span></span>
                <Field component='input' name='duration' initialValue={'1'} min={1} max={90} />
              </div>
            </div>
            <div className='form-APR'>
              <div>
                <span>APR (%)</span>
                <Field name='apr' component='input' />
              </div>
              <div>
                <span>Total repay amount</span>
                <p>10,493 USDC</p>
              </div>
            </div>
            <button>
              <div className='btn-content'>
                <p className=''>Create</p>
              </div>
            </button>
          </div>
        </form>
      )}
    />
  )
})
