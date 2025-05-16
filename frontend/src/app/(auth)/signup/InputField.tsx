import * as React from 'react'
import { InputFieldProps } from './types'

export const InputField: React.FC<InputFieldProps> = ({
  label,
  value,
  type = 'text',
}) => (
  <div className="flex gap-4 items-center p-4 w-full text-base font-medium tracking-normal bg-white rounded-lg border border-solid border-zinc-300">
    <label className="self-stretch my-auto leading-snug text-zinc-600 w-[55px]">
      {label}
    </label>
    <div className="shrink-0 self-stretch my-auto w-0 h-6 border border-solid bg-stone-400 border-stone-400" />
    <input
      type={type}
      value={value}
      className="self-stretch my-auto text-stone-700 bg-transparent border-none outline-none"
      aria-label={label}
    />
  </div>
)
