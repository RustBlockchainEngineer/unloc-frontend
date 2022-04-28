import React, { useContext, useRef, useState, useEffect, FormEvent } from 'react'
import { observer } from 'mobx-react'
import { toast } from 'react-toastify'
import { Form, Field } from 'react-final-form'
import { StoreContext } from '@pages/_app'
import { SubOfferInterface } from '@stores/LoanActionStore'
import { calculateRepayValue } from '@utils/calculateRepayValue'
import { BlobLoader } from '@components/layout/blobLoader'
import { getDecimalsForLoanAmount } from '@integration/getDecimalForLoanAmount'
import { currencyMints } from '@constants/currency'
import { calculateAprFromRepayValue } from '@utils/calculateAprFromRepayValue'
import { SwitchButton } from '@components/layout/switchButton'
import { calculateAprFromTotalRepayAndApr } from '@utils/calculateAmountFromTotalRepayAndApr'

interface CreateLoanProps {
  mode: 'new' | 'update'
}

export const CreateLoan: React.FC<CreateLoanProps> = observer(({ mode }) => {
  const store = useContext(StoreContext)
  const { connected, wallet, walletKey } = store.Wallet
  const { activeSubOffer, activeSubOfferData } = store.Lightbox

  const [processing, setProcessing] = useState(false)
  const [repayValue, setRepayValue] = useState(
    mode === 'update' ? getDecimalsForLoanAmount(activeSubOfferData.offerAmount, activeSubOfferData.offerMint) : '0.00'
  )
  const [interestMode, setInterestMode] = useState(false)

  const amountRef = useRef<HTMLInputElement>(null)
  const durationRef = useRef<HTMLInputElement>(null)
  const aprRef = useRef<HTMLInputElement>(null)
  const accruedRef = useRef<HTMLInputElement>(null)

  const onSubmit = async (values: SubOfferInterface) => {
    if (connected && wallet && walletKey) {
      if (!(amountRef.current && durationRef.current && aprRef.current && accruedRef.current)) {
        return
      }

      const { currency } = values

      const amount = Number(amountRef.current.value)
      const duration = Number(durationRef.current.value)
      let apr, accrued

      if (Number(aprRef.current.value) === 0) {
        accrued = Number(accruedRef.current.value)
        apr = calculateAprFromRepayValue(amount, amount + accrued, duration, store.GlobalState.denominator)
      } else {
        apr = Number(aprRef.current.value)
        accrued = +(amount * ((apr / 36500) * duration)).toFixed(4)
      }

      if (mode === 'new') {
        try {
          if (store.Lightbox.content === 'loanCreate' && store.MyOffers.activeNftMint) {
            store.Lightbox.setCanClose(false)
            setProcessing(true)

            await store.MyOffers.handleCreateSubOffer(
              store.MyOffers.activeNftMint,
              Number(amount + accrued),
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
          } else if ((e as Error).message.includes('503 Service Unavailable')) {
            toast.error('Solana RPC currently inavailable', {
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
        store.Lightbox.setCanClose(false)
        setProcessing(true)
        try {
          await store.MyOffers.handleEditSubOffer(
            Number(amount + accrued),
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
          } else if ((e as Error).message.includes('503 Service Unavailable')) {
            toast.error('Solana RPC currently inavailable', {
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

  const handleInterestModeChange = () => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return
    }

    setInterestMode(!interestMode)

    const accrued = Number(accruedRef.current.value)
    const amount = Number(amountRef.current.value)
    const duration = Number(durationRef.current.value)
    const apr = Number(aprRef.current.value)

    if (interestMode) {
      aprRef.current.value = calculateAprFromRepayValue(amount, amount + accrued, duration, store.GlobalState.denominator)
      accruedRef.current.value = ''
    } else {
      accruedRef.current.value = ((amount * apr * duration) / (365 * (store.GlobalState.denominator / 100))).toFixed(6).toString()
      aprRef.current.value = ''
    }
  }

  const onValueInput = (e: FormEvent<HTMLInputElement>) => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return
    }

    const name = (e.target as HTMLInputElement).name

    const amount = Number(amountRef.current.value)
    const duration = Number(name === 'duration' ? (e.target as HTMLInputElement).value : durationRef.current.value)
    const apr = Number(aprRef.current.value)
    
    if (name === 'duration') {
      durationRef.current.value = duration.toString()
    }

    if (interestMode) {
      setRepayValue(
        calculateRepayValue(amount, apr, duration, store.GlobalState.denominator)
      )
    } else {
      setRepayValue(
        calculateRepayValue(amount, apr, duration, store.GlobalState.denominator)
      )
    }
  }

  const onInterestInput = (e: FormEvent<HTMLInputElement>) => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return
    }

    const accrued = Number(accruedRef.current.value)
    const amount = Number(amountRef.current.value)
    const duration = Number(durationRef.current.value)

    const apr = calculateAprFromRepayValue(amount, amount + accrued, duration, store.GlobalState.denominator)

    setRepayValue(
      calculateRepayValue(amount, parseFloat(apr), duration, store.GlobalState.denominator)
    )
  }

  const onAprInput = (e: FormEvent<HTMLInputElement>) => {
    if (!(accruedRef.current && amountRef.current && durationRef.current && aprRef.current)) {
      return
    }

    const apr = Number(aprRef.current.value)
    const amount = Number(amountRef.current.value)
    const duration = Number(durationRef.current.value)

    setRepayValue(
      calculateRepayValue(amount, apr, duration, store.GlobalState.denominator)
    )
  }

  const getInitialValueOnUpdate = () => {
    if (mode === 'update' && activeSubOfferData) {
      return +getDecimalsForLoanAmount(activeSubOfferData.offerAmount, activeSubOfferData.offerMint)
      /*
      return +calculateAprFromTotalRepayAndApr(
        activeSubOfferData.offerAmount,
        activeSubOfferData.aprNumerator,
        activeSubOfferData.loanDuration,
        store.GlobalState.denominator
      )
      */
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
                  ref={amountRef}
                  onInput={onValueInput}
                  type='number'
                  name='loanvalue'
                  step={(values && values.currency && values.currency.toUpperCase()) == 'USDC' ? '0.01' : '0.001'}
                  min={(values && values.currency && values.currency.toUpperCase()) == 'USDC' ? 0.1 : 0.01}
                  placeholder='Amount'
                  className='input-text'
                  initialValue={
                    getInitialValueOnUpdate() || ((values && values.currency && values.currency.toUpperCase()) == 'USDC' ? 1000 : 10)
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
                  onInput={onValueInput}
                  component='input'
                  name='duration'
                  type='range'
                  min={1}
                  max={90}
                  initialValue={
                    mode === 'update' && activeSubOfferData
                      ? activeSubOfferData.loanDuration / (3600 * 24)
                      : 1
                  }
                />
              </div>
              <div>
                <span></span>
                <Field
                  ref={durationRef}
                  onInput={onValueInput}
                  component='input'
                  name='duration'
                  type='number'
                  min={1}
                  max={90}
                  className='input-text'
                  initialValue={
                    mode === 'update' && activeSubOfferData
                      ? activeSubOfferData.loanDuration / (3600 * 24)
                      : 1
                  }
                />
              </div>
            </div>
            <div className='form-line form-APR'>
              <div>
                <span>APR (%)</span>
                <input
                  ref={aprRef}
                  onInput={onAprInput}
                  type='number'
                  name='apr'
                  step={0.01}
                  min={0.01}
                  defaultValue={!interestMode ? (mode === 'update' && activeSubOfferData ? activeSubOfferData.aprNumerator : 500) : ''}
                  className={`input-text ${interestMode ? 'disabled' : ''}`}
                  disabled={interestMode}
                />
              </div>
              <SwitchButton state={!interestMode} onClick={() => handleInterestModeChange()} />
              <div>
                <span>Interest</span>
                <input
                  ref={accruedRef}
                  onInput={onInterestInput}
                  type='number'
                  name='interest'
                  step={0.000001}
                  min={0.000001}
                  defaultValue={
                    interestMode ? (mode === 'update' && activeSubOfferData ? (
                    activeSubOfferData.offerAmount * activeSubOfferData.aprNumerator * activeSubOfferData.loanDuration) /
                    (3600 * 24 * 365 * (store.GlobalState.denominator / 100))
                    : 1)  : ''
                  }
                  className={`input-text ${interestMode ? '' : 'disabled'}`}
                  disabled={!interestMode}
                />
              </div>
            </div>
            <div className='form-line form-repaid'>
              <div>
                <span className='title'>Total Repay Amount</span>
                <div className='amount'>
                  {repayValue}
                  <span>{values && values.currency ? values.currency.toUpperCase() : ''}</span>
                </div>
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
