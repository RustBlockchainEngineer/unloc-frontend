import React from 'react'

import { UnlocLogo } from './unlocLogo'
import { TopMenu } from './topMenu'
import { UserToolbox } from './userToolbox'

export const LayoutTopMobile = () => {
  return (
    <div className='layout-top-mobile'>
      <TopMenu />
      <UserToolbox />
    </div>
  )
}
