import React from 'react';

interface InfoBubbleProps {
  label: string;
  value?: string;
  valueClassName?: string;
  children?: React.ReactNode;
  placeholder?: string;
  type?: 'label' | 'input' | 'amount' | 'select';
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputValue?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  // select 관련
  selectValue?: string;
  onSelectChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
}

export const InfoBubble: React.FC<InfoBubbleProps> = ({
  label,
  value,
  valueClassName,
  children,
  placeholder,
  type = 'label',
  onChange,
  inputValue,
  inputProps,
  selectValue,
  onSelectChange,
  options,
}) => {
  return (
    <div className="flex items-center h-[56px] border border-[#D9D9D9] rounded-xl px-5 bg-white w-full" style={{ minWidth: 0 }}>
      <div className="text-sm font-medium text-[#262626] w-20 flex-shrink-0 truncate">{label}</div>
      <div style={{ marginLeft: 4, marginRight: 12, width: 1, height: 16, background: '#E5E5E5' }} />
      {type === 'input' ? (
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={onChange}
          className="flex-1 text-sm text-[#262626] bg-transparent border-none outline-none placeholder:text-[#BFBFBF] min-w-0"
          {...inputProps}
        />
      ) : type === 'select' ? (
        <select
          value={selectValue}
          onChange={onSelectChange}
          className="flex-1 text-sm text-[#262626] bg-transparent border-none outline-none min-w-0 appearance-none"
        >
          {options?.map(opt => (
            <option key={opt.value} value={opt.value} className="text-[#262626]">
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'amount' ? (
        <div className={`flex-1 text-lg font-semibold text-[#262626] text-right ${valueClassName || ''}`}>{value}</div>
      ) : (
        <div className={`flex-1 text-sm text-[#262626] text-right ${valueClassName || ''}`}>{value || children}</div>
      )}
    </div>
  );
}; 