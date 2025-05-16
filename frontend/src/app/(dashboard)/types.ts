export interface CalendarDayProps {
  day: number
  isCurrentMonth: boolean
  hasEvent?: boolean
}

export interface TabProps {
  label: string
  isActive: boolean
}

export interface EmptyStateProps {
  title: string
  imageUrl: string
  message: string
}

export interface NavItem {
  label: string
  isActive?: boolean
}

export interface MenuLink {
  label: string
  icon: string
}

export interface StatusBarIcon {
  src: string
  alt: string
  width: string
  aspectRatio: string
}

export interface IconButtonProps {
  children?: React.ReactNode
  onClick?: () => void
  className?: string
}

export interface LogoutModalProps {
  onLogout: () => void
  onClose: () => void
}

export interface CancellationOption {
  id: number
  text: string
  selected?: boolean
}
