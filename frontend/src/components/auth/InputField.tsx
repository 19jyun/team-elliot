import * as React from 'react'
import { cn } from '@/lib/utils'
import { Visibility, VisibilityOff } from '@mui/icons-material'

interface InputFieldProps {
  label: string
  icon?: string
  type?: string
  id?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  onIconClick?: () => void
  showPassword?: boolean
  error?: boolean
  errorMessage?: string
  onClear?: () => void
  placeholder?: string
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  icon,
  type = 'text',
  id,
  value,
  onChange,
  required = false,
  onIconClick,
  showPassword,
  error = false,
  errorMessage,
  onClear,
  placeholder,
}) => {
  return (
    <div className="relative">
      {errorMessage && (
        <div className="absolute -top-5 right-0 text-sm text-red-500 animate-shake">
          {errorMessage}
        </div>
      )}
      <div
        className={cn(
          'flex justify-between items-center p-4 w-full bg-white rounded-lg border border-solid transition-all duration-200',
          error
            ? 'border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)] animate-shake'
            : 'border-zinc-300 hover:border-zinc-400 focus-within:border-blue-500 focus-within:shadow-[0_0_0_1px_rgba(59,130,246,0.2)]',
        )}
      >
        <div className="flex gap-4 items-center self-stretch my-auto">
          <label
            htmlFor={id}
            className={cn(
              "self-stretch my-auto w-[55px] font-['Pretendard_Variable'] text-base font-medium leading-[140%] tracking-[-0.16px]",
              error ? 'text-red-500' : 'text-[#595959]',
            )}
          >
            {label}
          </label>
          <div
            className={cn(
              'shrink-0 self-stretch my-auto w-0 h-6 border border-solid',
              error
                ? 'bg-red-500 border-red-500'
                : 'bg-[#D9D9D9] border-[#D9D9D9]',
            )}
          />
        </div>
        <input
          type={type}
          id={id}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={cn(
            "ml-4 w-full bg-transparent border-none outline-none font-['Pretendard_Variable'] text-base font-medium leading-[140%] tracking-[-0.16px]",
            error ? 'text-red-500 placeholder-red-300' : 'text-[#595959]',
          )}
          aria-label={label}
          aria-invalid={error}
        />
        {value && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </button>
        )}

        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className={cn(
              'ml-4 p-0 border-0 bg-transparent cursor-pointer',
              error ? 'text-red-500' : 'text-[#595959]',
            )}
          >
            {showPassword ? (
              <Visibility sx={{ width: 24, height: 24 }} />
            ) : (
              <VisibilityOff sx={{ width: 24, height: 24 }} />
            )}
          </button>
        )}
      </div>
    </div>
  )
}
