import React from 'react'
import { localesFooterCommunity, localesFooterCompany, localesFooterLegal } from '../../constants/locales'

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
      {/* <div className='footer-logo'>
        <img src='' />
        <img src='' />
      </div> */}
      <div className='footer-links'>
        <div className='community-section'>
          <h2 className='footer-header'>community</h2>
          <ul className='footer-list'>{createList(localesFooterCommunity)}</ul>
        </div>
        <div className='community-section'>
          <h2 className='footer-header'>legal</h2>
          <ul className='footer-list'>{createList(localesFooterCompany)}</ul>
        </div>
        <div className='community-section'>
          <h2 className='footer-header'>company</h2>
          <ul className='footer-list'>{createList(localesFooterLegal)}</ul>
        </div>
      </div>
    </div>
  )
}

export default Footer
