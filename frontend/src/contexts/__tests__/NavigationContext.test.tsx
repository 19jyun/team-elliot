// src/contexts/__tests__/ImprovedNavigationContext.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from '@/lib/auth/AuthProvider';
import { NavigationProvider, useNavigation } from '../navigation/NavigationContext';
// Mock SessionProvider
const mockSession = {
  data: {
    user: {
      role: 'STUDENT',
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
    },
    expires: '2024-12-31T23:59:59.999Z',
  },
  status: 'authenticated',
  user: {
    role: 'STUDENT',
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
  },
  expires: '2024-12-31T23:59:59.999Z',
};

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => mockSession,
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard/student'),
}));

// Test component
const TestComponent = () => {
  const navigation = useNavigation();
  const [result, setResult] = React.useState<string>('');

  const handleTabChange = () => {
    navigation.handleTabChange(1);
    setResult('tab-changed');
  };

  return (
    <div>
      <button onClick={handleTabChange} data-testid="tab-change-button">
        Change Tab
      </button>
      <div data-testid="result">{result}</div>
      <div data-testid="active-tab">{navigation.activeTab}</div>
      <div data-testid="navigation-items-count">{navigation.navigationItems.length}</div>
    </div>
  );
};

describe('ImprovedNavigationContext', () => {
  it('should provide navigation context', () => {
    render(
      <SessionProvider session={mockSession}>
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      </SessionProvider>
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');
    expect(screen.getByTestId('navigation-items-count')).toHaveTextContent('3'); // STUDENT role
  });

  it('should handle tab changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('tab-change-button'));

    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('tab-changed');
      expect(screen.getByTestId('active-tab')).toHaveTextContent('1');
    });
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useNavigation must be used within an NavigationProvider');

    consoleSpy.mockRestore();
  });

  it('should handle different user roles', () => {
    const teacherSession = {
      ...mockSession,
      data: {
        ...mockSession.data,
        user: {
          ...mockSession.data.user,
          role: 'TEACHER',
        },
      },
    };

    render(
      <SessionProvider session={teacherSession}>
        <NavigationProvider>
          <TestComponent />
        </NavigationProvider>
      </SessionProvider>
    );

    expect(screen.getByTestId('navigation-items-count')).toHaveTextContent('3'); // TEACHER role
  });
});
