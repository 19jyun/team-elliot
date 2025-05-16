import * as React from 'react'

interface IconComponentProps {
  src: string
  className?: string
}

export const IconComponent: React.FC<IconComponentProps> = ({
  src,
  className,
}) => {
  return (
    <img
      loading="lazy"
      src={src}
      alt=""
      className={`object-contain shrink-0 self-stretch my-auto w-6 aspect-square ${
        className || ''
      }`}
    />
  )
}
