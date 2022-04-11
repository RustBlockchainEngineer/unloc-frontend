import React, {useState} from 'react'

import { TopMenu } from './topMenu'
import { UserToolbox } from './userToolbox'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { MenuShowButton } from './menuShowButton'

export const LayoutTopMobile = () => {
  const [menuShow, setMenuShow] = useState(false)

  return (
    <>
    <div className={menuShow ? 'layout-top-mobile' : 'layout-top-mobile hidden'}>
      <UserToolbox />
      <TopMenu />
    </div>
    <MenuShowButton showState={menuShow} changeShow={setMenuShow}/>
    </>
  )
}
