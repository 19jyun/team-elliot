export interface StatusBadgeProps {
  text: string
}

export interface NavigationItemProps {
  label: string
  isActive?: boolean
}

export interface EnrollmentCardProps {
  title: string
  isNew?: boolean
  onClick?: () => void
}

export interface NoticeProps {
  title: string
  content: string
}

export interface PolicySectionProps {
  title: string
  content: string[]
}

export interface PolicyData {
  sections: PolicySectionProps[]
}

export interface PolicySectionProps {
  title: string
  content: string[]
}

export interface CheckboxProps {
  text: string
  iconSrc: string
}

export interface ButtonProps {
  text: string
  disabled?: boolean
  onClick?: () => void
  className?: string
  isScrolledToBottom?: boolean
}

export interface CheckboxAgreementProps {
  text: string
  iconSrc: string
  onChange?: (checked: boolean) => void
}
