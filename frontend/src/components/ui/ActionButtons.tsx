import * as React from 'react'

export function ActionButtons() {
  return (
    <div className="flex gap-3 justify-center items-start px-5 pt-2.5 pb-4 w-full text-base font-semibold leading-snug whitespace-nowrap bg-white">
      <div className="flex flex-1 shrink gap-3 items-center w-full basis-0 min-w-[240px]">
        <button
          className="flex-1 shrink self-stretch px-3 py-4 my-auto rounded-lg bg-zinc-300 min-h-[56px] text-neutral-700"
          tabIndex={0}
        >
          취소
        </button>
        <button
          className="flex-1 shrink self-stretch px-3 py-4 my-auto text-white rounded-lg bg-stone-400 min-h-[56px]"
          tabIndex={0}
        >
          이동하기
        </button>
      </div>
    </div>
  )
}
