import React from 'react'

import { BlobLoader } from '../layout/blobLoader'

export const Processing = () => {
  return (
    <div className='lightbox-processing'>
      <BlobLoader />
      <span>Processing Transaction</span>
    </div>
  )
}
