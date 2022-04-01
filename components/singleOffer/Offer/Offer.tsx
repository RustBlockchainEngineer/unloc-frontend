import React from 'react'

type IProps = {
  offerID: string
  status: 'Active' | 'Disable'
  amount: string
  token: string
  duration: string
  durationRemaning: string
  APR: string
  totalReapy: string
}

const Offer: React.FC<IProps> = ({ offerID, status, amount, token, duration, durationRemaning, APR, totalReapy }) => {
  return (
    <div className='offer-root'>
      <div className='offer-container'>
        <div className='offer-header'>
          <div className='offer-ID'>
            <p>Offer ID</p>
            <p>#{offerID}</p>
          </div>
          <div className='offer-status'>
            <p>Status</p>
            <p>{status}</p>
          </div>
        </div>
        <div className='offer-info'>
          <div className='info-item'>
            <div className='item-box'>
              <p>Amount</p>
              <p>
                {amount} {token}
              </p>
            </div>
            <div className='item-box'>
              <p>APR</p>
              <p>{APR} %</p>
            </div>
          </div>
          <div className='info-item'>
            <div className='item-box'>
              <p>Duration</p>
              <p>
                {duration} days ({durationRemaning} days left)
              </p>
            </div>
            <div className='item-box'>
              <p>Total repay amount</p>
              <p>
                {totalReapy} {token}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='offer-lend'>
        <button className='lend-btn' onClick={() => {}}>
          Lend money
        </button>
      </div>
    </div>
  )
}

export default Offer
