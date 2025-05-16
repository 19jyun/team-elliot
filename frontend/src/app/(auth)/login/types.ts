export interface InputFieldProps {
  label: string
  icon?: string
  type?: string
  id: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  onIconClick?: () => void
  showPassword?: boolean
  error?: boolean
  errorMessage?: string
}

export interface ButtonProps {
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
}

export interface StatusBarIconProps {
  src: string
  alt: string
}
