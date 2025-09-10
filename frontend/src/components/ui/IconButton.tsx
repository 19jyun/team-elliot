import * as React from 'react'

interface IconButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function IconButton({ children, onClick, className }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11 ${className}`}
      tabIndex={0}
      aria-label="Icon button"
    >
      {children}
    </button>
  )
}
