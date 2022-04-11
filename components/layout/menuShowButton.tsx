import React from 'react'

interface MenuShowButtonProps {
  showState: boolean
  changeShow: React.Dispatch<React.SetStateAction<boolean>>
}


export const MenuShowButton: React.FC<MenuShowButtonProps> = ({
  showState,
  changeShow
}: MenuShowButtonProps) => {
  return (
    <div className='menu-show-button' onClick={() => changeShow(!showState)}>
      <div className={showState ? 'menu-show-button-hamburger clicked' : 'menu-show-button-hamburger'} >
          <div className="strip burger-strip-2">
            <div></div>
            <div></div>
            <div></div>
          </div>
      </div>
    </div>
  )
}
