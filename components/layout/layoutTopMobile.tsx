import React, {useState} from 'react'

import { TopMenu } from './topMenu'
import { UserToolbox } from './userToolbox'
import { MenuShowButton } from './menuShowButton'

export const LayoutTopMobile = () => {
  const [menuShow, setMenuShow] = useState(false)

  return (
    <>
    <div className={menuShow ? 'layout-top-mobile' : 'layout-top-mobile hidden'}>
      <UserToolbox />
      <TopMenu />
    </div>
    <MenuShowButton menuShowState={menuShow} changeMenuShow={setMenuShow}/>
    </>
  )
}
