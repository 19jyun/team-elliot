import { ClassFee } from './types';

interface ClassFeeListProps {
  classFees: ClassFee[];
}

export function ClassFeeList({ classFees }: ClassFeeListProps) {
  return (
    <>
      {classFees.map((fee, idx) => (
        <div key={fee.name} className="flex flex-row justify-between items-start w-full gap-5">
          <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[109px]">
            <span className="flex items-center text-[#31220F] font-normal text-base leading-[19px]">
              {idx === 0 ? '수강금액' : ''}
            </span>
          </div>
          <div className="flex flex-row items-center m-auto px-[19px] py-2.5 gap-2 w-[226px]">
            <div className="flex flex-col gap-1">
              <span className="flex items-center text-[#31220F] font-semibold text-base leading-[19px]">
                {fee.name}
              </span>
              <span className="flex items-center text-[#31220F] font-semibold text-base leading-[19px]">
                {fee.count}회 / {fee.price.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
} 