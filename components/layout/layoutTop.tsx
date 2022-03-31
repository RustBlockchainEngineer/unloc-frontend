import React from 'react'

import { UnlocLogo } from './unlocLogo'
import { TopMenu } from './topMenu'
import { UserToolbox } from './userToolbox'

export const LayoutTop = () => {
  return (
    <div className='layout-top'>
      <UnlocLogo />
      <TopMenu />
      <UserToolbox />
    </div>
  )
}
