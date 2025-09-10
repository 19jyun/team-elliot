import * as React from 'react'

interface CheckboxAgreementProps {
  text: string;
  onChange?: (checked: boolean) => void;
}

export const CheckboxAgreement: React.FC<CheckboxAgreementProps> = ({
  text,
  onChange,
}) => {
  const [checked, setChecked] = React.useState(false)

  const handleChange = () => {
    const newChecked = !checked
    setChecked(newChecked)
    onChange?.(newChecked)
  }

  return (
    <div className="flex gap-2 items-center px-5 py-4 w-full bg-stone-50">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          className="absolute opacity-0 w-4 h-4 cursor-pointer"
        />
        <div
          className={`w-4 h-4 border rounded transition-colors ${
            checked ? 'bg-[#AC9592] border-[#AC9592]' : 'border-[#AC9592]'
          }`}
        >
          {checked && (
            <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white">
              <path
                d="M20 6L9 17L4 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div className="text-sm text-stone-600">{text}</div>
      </div>
    </div>
  )
}
