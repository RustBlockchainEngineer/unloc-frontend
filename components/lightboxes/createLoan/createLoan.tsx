import React from 'react'

interface IProps {
  onClick: () => {}
}

const createLoan: React.FC<IProps> = ({ onClick }) => {
  return (
    <div className='create-offer-container'>
      <h1>Create Loan Offer</h1>
      <div className='create-offer-inputs'>
        <label htmlFor='value'>Loan Value</label>
        <input name='value' />
        <label htmlFor='currency'>Currency</label>
        <select name='currency'>
          <option value='USDC'>USDC</option>
          <option value='USDT'>USDT</option>
          <option value='SOL'>SOL</option>
        </select>
        <label htmlFor='duration'>Duration</label>
        <input type='range' value={1} min={1} max={90} />
      </div>
      <div className='total-repay'>
        <label htmlFor='APR'> APR(%)</label>
        <input name='APR' />
        <p>10,493 USDC</p>
      </div>
      <button>Create</button>
    </div>
  )
}
