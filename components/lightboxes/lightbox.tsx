import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { StoreContext } from '../../pages/_app'

interface LightboxProps {
  children: JSX.Element
  classNames?: string
}

export const Lightbox: React.FC<LightboxProps> = observer(({ children, classNames }: LightboxProps) => {
  const store = useContext(StoreContext)

  const closeWindow = (e: any, check: boolean) => {
    if (e.target !== e.currentTarget && check) {
      return
    }

    store.Lightbox.setVisible(false)
  }

  return (
    <div
      onClick={(e) => {
        closeWindow(e, true)
      }}
      className={`lightbox ${classNames ? classNames : ''}`}
    >
      <div
        className='lightbox__container'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key == 'Escape') {
            store.Lightbox.setVisible(false)
          }
        }}
      >
        <i
          onClick={(e) => {
            closeWindow(e, false)
          }}
          className='icon icon--cross lightbox__close'
        ></i>
        {children}
      </div>
    </div>
  )
})
