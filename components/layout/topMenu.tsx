import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { localesTop } from '../../constants/locales'

export const TopMenu = () => {
  const router = useRouter()

  const handleCurrent = (name: string): string => {
    console.log(router.pathname)
    // return `top-nav__page ${name === page ? 'selected' : ''}`
    return ''
  }

  return (
    <ul className='top-menu'>
      <li>
        <Link href='/'>{localesTop.home}</Link>
      </li>
      <li>
        <Link href='/my-offers'>{localesTop.myOffers}</Link>
      </li>
    </ul>
  )
}
