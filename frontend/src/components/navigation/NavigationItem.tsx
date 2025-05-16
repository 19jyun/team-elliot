import * as React from 'react'

interface NavigationItemProps {
  label: string
  isActive?: boolean
}

export const NavigationItem: React.FC<NavigationItemProps> = ({
  label,
  isActive = false,
}) => {
  return (
    <div
      className={`flex justify-center items-center px-4 py-3 text-sm font-medium transition-colors duration-200 relative
        ${
          isActive
            ? 'text-stone-800'
            : 'text-stone-500 hover:text-stone-700 hover:bg-stone-50'
        }`}
      role="tab"
      tabIndex={0}
      aria-selected={isActive}
    >
      {label}
      {isActive && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-800" />
      )}
    </div>
  )
}
