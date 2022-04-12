import React from 'react'

import { useClipboard } from '@hooks/useClipboard'

interface ClipboardButtonProps {
  data: string
  classNames?: string
  state?: boolean
}

export const ClipboardButton: React.FC<ClipboardButtonProps> = ({ data, classNames, state }: ClipboardButtonProps) => {
  const [visible, setVisible] = useClipboard(data)

  return <i className={`icon icon--sm icon--copy clipboard-icon ${classNames}`} onClick={() => setVisible()} />
}
