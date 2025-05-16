import * as React from 'react'

export const AddressBar: React.FC = () => {
  return (
    <div className="flex flex-col justify-center px-3 py-2.5 w-full text-lg whitespace-nowrap bg-white shadow-sm text-neutral-800 max-sm:hidden">
      <div className="flex gap-5 justify-between py-2 pr-3.5 pl-16 w-full bg-gray-200 rounded-[30px] max-sm:hidden">
        <div className="flex gap-2 justify-center items-center">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/80fa449a1b0df7949a8a13433a9b18186ac2fac252e0e985ab67b5cbf43ecd4b?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
          />
          <div className="self-stretch my-auto">teamelliot.kr/</div>
        </div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/e52511d6c5f60e9f9c3b11bf91e9b94a881bfe5786f53d160c28e24d7a17c460?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt=""
          className="object-contain shrink-0 aspect-square w-[21px]"
        />
      </div>
    </div>
  )
}
