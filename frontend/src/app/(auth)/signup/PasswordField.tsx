import * as React from 'react'
import { PasswordFieldProps } from './types'

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  value,
  showPassword = false,
  hasError = false,
  onToggleVisibility,
}) => (
  <div
    className={`flex gap-10 justify-between items-center p-4 mt-3 w-full text-base font-medium tracking-normal whitespace-nowrap bg-white rounded-lg border border-solid ${
      hasError ? 'border-stone-700' : 'border-zinc-300'
    }`}
  >
    <div className="flex gap-4 items-center self-stretch my-auto">
      <div className="flex gap-4 items-center self-stretch my-auto leading-snug text-zinc-600">
        <div className="self-stretch my-auto w-[90px]">{label}</div>
        <div className="shrink-0 self-stretch my-auto w-0 h-6 border border-solid bg-stone-400 border-stone-400" />
      </div>
      <div className="self-stretch my-auto text-stone-700">
        {showPassword ? value : '***********'}
      </div>
    </div>
    {onToggleVisibility && (
      <img
        loading="lazy"
        src="https://cdn.builder.io/api/v1/image/assets/TEMP/393492c201cd5c93221ec04b1545f31cfcc52f844db52c2222b94546570323c6?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
        alt="Toggle password visibility"
        className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
        onClick={onToggleVisibility}
        tabIndex={0}
        role="button"
        onKeyPress={(e) => e.key === 'Enter' && onToggleVisibility()}
      />
    )}
  </div>
)
