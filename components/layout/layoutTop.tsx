import React, { useContext } from 'react'
import { observer } from 'mobx-react'

import { StoreContext } from '../../pages/_app'
import { UnlocLogo } from './unlocLogo'
import { TopMenu } from './topMenu'
import { UserToolbox } from './userToolbox'
import { Lightbox } from '../lightboxes/lightbox'
import { CreateCollateral } from '../lightboxes/chooseCollateral/createCollateral'
import { CreateLoan } from '../lightboxes/createLoan/createLoan'
import { Processing } from '../lightboxes/processing'

export const LayoutTop = observer(() => {
  const store = useContext(StoreContext)
  const { visible, content } = store.Lightbox

  return (
    <>
      <div className='layout-top'>
        <UnlocLogo />
        <TopMenu />
        <UserToolbox />
      </div>
      {visible ? (
        <Lightbox>
          <>
            {content === 'collateral' ? <CreateCollateral /> : <></>}
            {content === 'loanCreate' ? <CreateLoan mode='new' /> : <></>}
            {content === 'loanUpdate' ? <CreateLoan mode='update' /> : <></>}
            {content === 'processing' ? <Processing /> : <></>}
          </>
        </Lightbox>
      ) : (
        <></>
      )}
    </>
  )
})
