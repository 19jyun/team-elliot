'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './input';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({ 
  value, 
  onChange, 
  placeholder = "전화번호를 입력하세요", 
  className = "",
  disabled = false 
}: PhoneInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // 전화번호를 010-1234-5678 형식으로 변환
  const formatPhoneNumber = (input: string) => {
    // 숫자만 추출
    const numbers = input.replace(/[^\d]/g, '');
    
    // 11자리 이하로 제한
    const limited = numbers.slice(0, 11);
    
    // 형식 적용
    if (limited.length <= 3) {
      return limited;
    } else if (limited.length <= 7) {
      return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    } else {
      return `${limited.slice(0, 3)}-${limited.slice(3, 7)}-${limited.slice(7)}`;
    }
  };



  useEffect(() => {
    // 외부에서 전달된 value를 형식에 맞게 변환
    if (value) {
      setDisplayValue(formatPhoneNumber(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    const formatted = formatPhoneNumber(input);
    
    setDisplayValue(formatted);
    
    // 포맷팅된 값을 그대로 부모 컴포넌트에 전달
    onChange(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 백스페이스로 하이픈을 건너뛰기
    if (e.key === 'Backspace') {
      const cursorPosition = e.currentTarget.selectionStart;
      if (cursorPosition !== null) {
        const beforeCursor = displayValue.slice(0, cursorPosition);
        const afterCursor = displayValue.slice(cursorPosition);
        
        // 하이픈 바로 앞에 커서가 있으면 하이픈을 건너뛰기
        if (beforeCursor.endsWith('-')) {
          e.preventDefault();
          const newValue = beforeCursor.slice(0, -1) + afterCursor;
          const formatted = formatPhoneNumber(newValue);
          setDisplayValue(formatted);
          
          // 커서 위치 조정
          setTimeout(() => {
            const newCursorPosition = cursorPosition - 1;
            e.currentTarget.setSelectionRange(newCursorPosition, newCursorPosition);
          }, 0);
          
          onChange(formatted);
        }
      }
    }
  };

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      maxLength={13} // 010-1234-5678 (13자)
    />
  );
} 