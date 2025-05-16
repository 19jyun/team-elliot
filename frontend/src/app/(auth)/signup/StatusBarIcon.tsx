import * as React from 'react'
import { StatusBarIconProps } from './types'

export const StatusBarIcon: React.FC<StatusBarIconProps> = ({
  src,
  alt,
  className,
}) => (
  <img
    loading="lazy"
    src={src}
    alt={alt}
    className={`object-contain shrink-0 self-stretch my-auto ${className}`}
  />
)
