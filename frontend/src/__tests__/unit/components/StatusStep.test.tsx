import { render, screen } from '@testing-library/react';
import { StatusStep } from '@/components/features/student/enrollment/month/StatusStep';
import type { ComponentProps } from 'react';

// Next.js Image 컴포넌트 모킹
jest.mock('next/image', () => {
  return function MockImage({ src, alt, ...props }: ComponentProps<'img'>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  };
});

describe('StatusStep Component', () => {
  const defaultProps = {
    icon: '/icons/test-icon.svg',
    label: '테스트 단계',
  };

  it('should render with default props', () => {
    render(<StatusStep {...defaultProps} />);
    
    expect(screen.getByText('테스트 단계')).toBeInTheDocument();
    expect(screen.getByAltText('테스트 단계 단계 아이콘')).toBeInTheDocument();
  });

  it('should render with completed state', () => {
    render(<StatusStep {...defaultProps} isCompleted={true} />);
    
    const label = screen.getByText('테스트 단계');
    expect(label).toHaveClass('text-stone-700');
    
    const image = screen.getByAltText('테스트 단계 단계 아이콘');
    expect(image).toHaveAttribute('src', '/icons/CourseRegistrationsStatusSteps1.svg');
  });

  it('should render with active state', () => {
    render(<StatusStep {...defaultProps} isActive={true} />);
    
    const label = screen.getByText('테스트 단계');
    expect(label).toHaveClass('text-stone-700');
    
    const image = screen.getByAltText('테스트 단계 단계 아이콘');
    expect(image).toHaveAttribute('src', '/icons/CourseRegistrationsStatusSteps1.svg');
  });

  it('should render with inactive state (default)', () => {
    render(<StatusStep {...defaultProps} />);
    
    const label = screen.getByText('테스트 단계');
    expect(label).toHaveClass('text-stone-300');
    
    const image = screen.getByAltText('테스트 단계 단계 아이콘');
    expect(image).toHaveAttribute('src', '/icons/CourseRegistrationsStatusSteps2.svg');
  });

  it('should prioritize completed state over active state', () => {
    render(<StatusStep {...defaultProps} isCompleted={true} isActive={true} />);
    
    const image = screen.getByAltText('테스트 단계 단계 아이콘');
    expect(image).toHaveAttribute('src', '/icons/CourseRegistrationsStatusSteps1.svg');
  });

  it('should render with correct image dimensions', () => {
    render(<StatusStep {...defaultProps} />);
    
    const image = screen.getByAltText('테스트 단계 단계 아이콘');
    expect(image).toHaveAttribute('width', '32');
    expect(image).toHaveAttribute('height', '32');
  });

  it('should render with correct CSS classes', () => {
    render(<StatusStep {...defaultProps} />);
    
    const container = screen.getByText('테스트 단계').closest('div')?.parentElement;
    expect(container).toHaveClass('flex', 'flex-col', 'flex-1', 'items-center');
  });

  it('should handle different label texts', () => {
    const customLabel = '커스텀 라벨';
    render(<StatusStep {...defaultProps} label={customLabel} />);
    
    expect(screen.getByText(customLabel)).toBeInTheDocument();
    expect(screen.getByAltText(`${customLabel} 단계 아이콘`)).toBeInTheDocument();
  });

  it('should handle empty label', () => {
    const { container } = render(<StatusStep {...defaultProps} label="" />);
    
    // 빈 문자열 대신 컨테이너의 존재를 확인
    expect(container.firstChild).toBeInTheDocument();
    // 이미지가 존재하는지 확인 (alt 텍스트 대신 role로 확인)
    expect(screen.getByRole('img')).toBeInTheDocument();
  });
});
