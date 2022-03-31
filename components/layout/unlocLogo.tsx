import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface UnlocLogoProps {
  classNames?: string
  logo?: 'light' | 'dark'
}
export const UnlocLogo: React.FC<UnlocLogoProps> = ({ classNames, logo }: UnlocLogoProps) => {
  return (
    <div className={`${classNames}`}>
      <Link href='/'>
        <a>
          {logo === 'light' ? (
            <Image src='/layout/unloc_logo-light.svg' alt='Unloc Logo' width={247} height={72} />
          ) : (
            <Image src='/layout/unloc_logo.svg' alt='Unloc Logo' width={247} height={72} />
          )}
        </a>
      </Link>
    </div>
  )
}
