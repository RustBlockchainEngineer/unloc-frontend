import React from 'react'

interface MenuShowButtonProps {
  menuVisibleState: boolean
  changeMenuVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

export const MenuShowButton: React.FC<MenuShowButtonProps> = ({
  menuVisibleState,
  changeMenuVisibility
}: MenuShowButtonProps) => {
  return (
    <div className='menu-show-button' onClick={() => changeMenuVisibility(!menuVisibleState)}>
      <div className={menuVisibleState ? 'menu-show-button-hamburger cross' : 'menu-show-button-hamburger strips'} >
          <div className="menu-show-button-hamburger_strips">
            <div className="strip" />
            <div className="strip" />
            <div className="strip" />
          </div>
      </div>
    </div>
  )
}
