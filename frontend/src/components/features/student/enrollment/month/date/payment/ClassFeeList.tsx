import { ClassFee } from './types';

interface ClassFeeListProps {
  classFees: ClassFee[];
}

export function ClassFeeList({ classFees }: ClassFeeListProps) {
  return (
    <div className="w-full font-[Pretendard Variable] text-sm">
      {classFees.map((fee, idx) => (
        <div key={fee.name} className="flex items-center justify-between py-1 w-full">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#595959] min-w-16">
              {idx === 0 ? '수강금액' : ''}
            </span>
            <span 
              className="font-bold text-[#573B30] max-w-32 truncate"
              title={fee.name}
            >
              {fee.name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bold text-[#573B30]">{fee.count}회 /</span>
            <span className="font-bold text-[#573B30] min-w-0 flex-shrink-0">
              {fee.price.toLocaleString()}원
            </span>
          </div>
        </div>
      ))}
    </div>
  );
} 