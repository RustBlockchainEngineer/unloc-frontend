import { observer } from 'mobx-react'
import React, { useContext } from 'react'
import { StoreContext } from '../../pages/_app'

interface LightboxProps {
  classNames?: string
  children: JSX.Element
}

export const Lightbox: React.FC<LightboxProps> = observer(({ children, classNames }: LightboxProps) => {
  const store = useContext(StoreContext)

  const closeWindow = (e: any, check: boolean) => {
    if (e.target !== e.currentTarget && check) {
      return
    }

    store.Lightbox.hideAllLightboxes()
  }

  return (
    <div
      onClick={(e) => {
        closeWindow(e, true)
      }}
      className={`lightbox ${classNames}`}
    >
      <div
        className='lightbox__container'
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key == 'Escape') {
            store.Lightbox.hideAllLightboxes()
          }
        }}
      >
        <i
          onClick={(e) => {
            closeWindow(e, false)
          }}
          className='icon icon--cross--primary lightbox__close'
        ></i>
        {children}
      </div>
    </div>
  )
})
