import * as React from 'react'
import Link from 'next/link'

interface MenuLink {
  label: string
  icon: string
  href: string
}

interface MenuLinksProps {
  links: MenuLink[]
}

export function MenuLinks({ links }: MenuLinksProps) {
  return (
    <div className="flex flex-col pr-4 pl-5 mt-3 w-full text-base font-semibold tracking-normal leading-snug text-stone-700">
      {links.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className="flex gap-10 justify-between items-center py-5 w-full hover:bg-gray-50 transition-colors cursor-pointer"
          role="button"
          tabIndex={0}
        >
          <div className="self-stretch my-auto">{link.label}</div>
          <img
            loading="lazy"
            src={link.icon}
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
          />
        </Link>
      ))}
    </div>
  )
}
