import React from 'react'

interface MenuShowButtonProps {
  menuShowState: boolean
  changeMenuShow: React.Dispatch<React.SetStateAction<boolean>>
}

export const MenuShowButton: React.FC<MenuShowButtonProps> = ({
  menuShowState,
  changeMenuShow
}: MenuShowButtonProps) => {
  return (
    <div className='menu-show-button' onClick={() => changeMenuShow(!menuShowState)}>
      <div className={menuShowState ? 'menu-show-button-hamburger clicked' : 'menu-show-button-hamburger'} >
          <div className="menu-show-button-hamburger_strips">
            <div className="strip" />
            <div className="strip" />
            <div className="strip" />
          </div>
      </div>
    </div>
  )
}
