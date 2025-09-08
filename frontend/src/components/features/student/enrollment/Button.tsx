import * as React from 'react'
import cn from 'classnames'

interface ButtonProps {
  text: string;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  isScrolledToBottom?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  disabled = false,
  onClick,
  className,
  isScrolledToBottom = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'flex-1 shrink gap-2.5 self-stretch px-2.5 py-4 rounded-lg min-w-[240px] size-full text-base font-semibold leading-snug text-white',
      {
        'bg-zinc-300': disabled,
        'bg-[#AC9592]': !isScrolledToBottom && !disabled,
      },
      className,
    )}
  >
    {text}
  </button>
)
