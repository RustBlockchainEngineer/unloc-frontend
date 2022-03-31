import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { localesTop } from '../../constants/locales'

export const TopMenu = () => {
  const router = useRouter()

  const handleCurrent = (path: string): string => {
    return `top-nav__page ${router.pathname === path ? 'active' : ''}`
  }

  return (
    <ul className='top-menu'>
      <li>
        <Link href='/'>
          <a className={handleCurrent('/')}>{localesTop.home}</a>
        </Link>
      </li>
      <li>
        <Link href='/my-offers'>
          <a className={handleCurrent('/my-offers')}>{localesTop.myOffers}</a>
        </Link>
      </li>
    </ul>
  )
}
