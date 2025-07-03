import { ClassFee } from './types';

interface ClassFeeListProps {
  classFees: ClassFee[];
}

export function ClassFeeList({ classFees }: ClassFeeListProps) {
  return (
    <div className="w-full font-[Pretendard Variable] text-sm">
      {classFees.map((fee, idx) => (
        <div key={fee.name} className="grid grid-cols-4 items-center py-1 w-full">
          <span className="font-semibold w-20 text-[#595959]">
            {idx === 0 ? '수강금액' : ''}
          </span>
          <span 
            className="font-bold text-[#573B30] truncate cursor-help text-left"
            title={fee.name}
            style={{
              maxWidth: '80px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {fee.name}
          </span>
          <span className="font-bold text-[#573B30] text-center w-12">{fee.count}회 /</span>
          <span className="font-bold text-[#573B30] text-right">{fee.price.toLocaleString()}원</span>
        </div>
      ))}
    </div>
  );
} 