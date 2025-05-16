import * as React from 'react'
import { ButtonProps } from './types'

export const Button: React.FC<ButtonProps> = ({
  children,
  disabled = false,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex gap-2.5 justify-center items-center px-2.5 py-4 w-full font-semibold text-white rounded-lg bg-zinc-300"
    >
      <span className="gap-0.5 self-stretch my-auto">{children}</span>
    </button>
  )
}
