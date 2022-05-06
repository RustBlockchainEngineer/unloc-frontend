import React from 'react'
import { localesFooterCommunity, localesFooterCompany, localesFooterLegal } from '@constants/locales'

const Footer: React.FC = () => {
  const createList = (data: { [x: string]: string }) => {
    return Object.entries(data).map(([key, value]) => (
      <li className='list-item' key={key}>
        <a href={value}>{key}</a>
      </li>
    ))
  }

  return (
    <div className='footer'>
      <div className='footer-links'>
        <div className='community-section'>
          <ul className='footer-list'>{createList(localesFooterCommunity)}</ul>
        </div>
      </div>
    </div>
  )
}

export default Footer
