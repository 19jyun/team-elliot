import * as React from 'react'
import { StatusBarIcon } from './StatusBarIcon'
import { ProgressBarItem } from './ProgressBarItem'
import { CheckboxItem } from './CheckboxItem'

export const TermsAndConditions: React.FC = () => {
  return (
    <div className="flex overflow-hidden flex-col pb-2 mx-auto w-full bg-white max-w-[480px]">
      <div className="flex justify-center items-center w-full bg-white min-h-[60px] max-sm:hidden">
        <div className="flex overflow-hidden flex-1 shrink gap-1 justify-center items-center self-stretch px-9 py-6 my-auto text-lg tracking-tight leading-none text-center text-black whitespace-nowrap basis-0 font-[590] min-h-[60px] max-sm:hidden">
          <div className="self-stretch my-auto w-[35px]">9:41</div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4e8736a26a142e1ec8b201682842001784745b236983c002f8b27d3bc6251b4f?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            className="object-contain shrink-0 self-stretch my-auto w-3.5 aspect-square"
          />
        </div>
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/3989d14512b027f5f3dc69b66233504de4b0fb11d200d14b991e2fdd0fd0a99c?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Logo"
          className="object-contain shrink-0 self-stretch my-auto aspect-[3.39] fill-black w-[122px] max-sm:hidden"
        />
        <div className="flex overflow-hidden flex-1 shrink gap-2.5 justify-center items-center self-stretch py-6 pr-6 pl-5 my-auto basis-[31px] min-h-[60px] max-sm:hidden">
          <StatusBarIcon
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/b20cf3d1a1089c2ce3efe80fde511dfa79ef6f908eb5c2afa869720c4b684cd6?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Signal Icon"
          />
          <StatusBarIcon
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/2fcf6e95083639433859129a4cedc3995440122436baed7bde49a1e55a25c2b4?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="WiFi Icon"
          />
          <StatusBarIcon
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/ad8416e32d558b3e2e98e7b3505a32dddc696afea388798cbb7abed266bcf512?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Battery Icon"
          />
        </div>
      </div>

      <div className="flex flex-col justify-center px-3 py-2.5 w-full text-lg whitespace-nowrap bg-white shadow-sm text-neutral-800">
        <div className="flex gap-5 justify-between py-2 pr-3.5 pl-16 w-full bg-gray-200 rounded-[30px] max-sm:hidden">
          <div className="flex gap-2 justify-center items-center">
            <img
              loading="lazy"
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/4d74427f5efa3bb80636af8afc7bd65185b50a388a7ea910c1be17801ef8c6ec?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              alt=""
              className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
            />
            <div className="self-stretch my-auto">teamelliot.kr/</div>
          </div>
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/4313820c823cd744425bf10fbb9cff3bfca003002461b7646343354a28968f9c?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt=""
            className="object-contain shrink-0 aspect-square w-[21px]"
          />
        </div>
      </div>

      <div className="flex gap-2.5 items-center px-2.5 py-2">
        <div className="flex gap-2.5 items-center self-stretch p-2.5 my-auto w-11">
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/99d663a7cc4ce56bcb24a91168e88c60bb7df63e17dace2e992d6911ce1c206c?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
            alt="Back"
            className="object-contain self-stretch my-auto w-6 aspect-square"
          />
        </div>
      </div>

      <div className="flex flex-col px-5 mt-6 w-full">
        <img
          loading="lazy"
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/97130cde9aeee244b068f8f7ae85c80577a223db166a059a272277cf5c389cd8?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
          alt="Logo"
          className="object-contain max-w-full aspect-[4.48] w-[220px]"
        />

        <ProgressBarItem current={3} total={3} />

        <div className="self-start mt-6 text-xl font-medium leading-tight text-stone-700">
          약관에 동의해주세요
        </div>

        <form className="flex flex-col mt-5 w-full">
          <div className="flex gap-2 items-center py-4 w-full text-base font-medium tracking-normal leading-snug border-b border-solid border-b-stone-400 text-stone-700">
            <div className="flex gap-2 items-center self-stretch px-1 my-auto">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/bec1032544384dfb8d2e50d5c619a90dc6aff4131ada8b881183578489e5c959?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
                alt=""
                className="object-contain shrink-0 self-stretch my-auto w-6 aspect-square"
              />
              <div className="self-stretch my-auto">모두 동의합니다</div>
            </div>
          </div>

          <div className="flex flex-col mt-4 w-full text-base tracking-normal">
            <CheckboxItem
              icon="https://cdn.builder.io/api/v1/image/assets/TEMP/4a6b0cff67e9996fdc464c43fae4b5cfe922f330451438093e69f7149d2d6a56?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              text="만 18세 이상입니다"
              required={true}
            />
            <CheckboxItem
              icon="https://cdn.builder.io/api/v1/image/assets/TEMP/cc6d268b69a5967ad5323898b931be48401c3b9901e07f9427848cfb5ce3f19b?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              text="서비스 이용약관 동의"
              required={true}
              showViewButton={true}
            />
            <CheckboxItem
              icon="https://cdn.builder.io/api/v1/image/assets/TEMP/c3f21840c11939c01fbeb8c8bfc788ca3c3847717d6abee64bd6fcdc665f16c5?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              text="서비스 이용약관 동의"
              required={true}
              showViewButton={true}
            />
            <CheckboxItem
              icon="https://cdn.builder.io/api/v1/image/assets/TEMP/7be0e58265309c96247d72c0d742926ff62ffc4d54809dc470b6853bae1a633d?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
              text="혜택/이벤트 정보 수신 동의"
            />
          </div>

          <button
            type="submit"
            className="flex gap-2.5 justify-center items-center px-2.5 py-4 mt-10 w-full text-base font-semibold text-white whitespace-nowrap rounded-lg bg-stone-400"
          >
            <div className="flex gap-0.5 items-center self-stretch my-auto">
              <div className="self-stretch my-auto">다음으로</div>
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/452499a6a7159b3d37dd9adcf4b98138d608b93128cb8bc5f085d868bdd25afd?placeholderIfAbsent=true&apiKey=1a4d049d8fe54d8aa58f4ebfa539d65f"
                alt=""
                className="object-contain shrink-0 self-stretch my-auto w-4 aspect-square"
              />
            </div>
          </button>
        </form>

        <div className="flex shrink-0 self-center mt-32 bg-black h-[5px] rounded-[100px] w-[134px] max-sm:hidden" />
      </div>
    </div>
  )
}
