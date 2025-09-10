import * as React from 'react'

interface PolicySectionProps {
  title: string;
  content: string[];
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  title,
  content,
}) => {
  return (
    <div className="flex flex-col mt-5 w-full leading-snug">
      <div className="font-semibold">{title}</div>
      {content.map((text, index) => (
        <div key={index} className="leading-6">
          {text}
        </div>
      ))}
    </div>
  )
}
