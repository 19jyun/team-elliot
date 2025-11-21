// src/contexts/__tests__/AppContext.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SessionProvider } from '@/lib/auth/AuthProvider';
import { AppProvider, useApp } from '../AppContext';

const mockEnrollmentState = {
  currentStep: 'academy-selection',
  selectedAcademyId: null,
  selectedClassIds: [],
  selectedSessions: [],
  selectedClasses: [],
  selectedClassesWithSessions: [],
  selectedMonth: null,
};

const mockEnrollmentModificationState = {
  currentStep: 'date-selection',
  modificationData: null,
};

const mockAuthState = {
  signup: {
    step: 'role-selection',
    role: null,
    personalInfo: { name: '', phoneNumber: '' },
    accountInfo: { userId: '', password: '', confirmPassword: '' },
    terms: { age: false, terms1: false, terms2: false, marketing: false },
  },
};

const mockPrincipalCreateClassState = {
  currentStep: 'info',
  classFormData: {
    name: '',
    description: '',
    level: 'BEGINNER',
    maxStudents: 0,
    price: 0,
    startDate: '',
    endDate: '',
    schedule: [],
  },
  selectedTeacherId: null,
};

const mockUseFormsValue = {
  forms: {
    enrollment: mockEnrollmentState,
    enrollmentModification: mockEnrollmentModificationState,
    auth: mockAuthState,
    principalCreateClass: mockPrincipalCreateClassState,
  },
  enrollment: mockEnrollmentState,
  enrollmentModification: mockEnrollmentModificationState,
  auth: mockAuthState,
  principalCreateClass: mockPrincipalCreateClassState,
  updateForm: jest.fn(),
  resetAllForms: jest.fn(),
  getFormState: jest.fn(),
  setEnrollmentStep: jest.fn(),
  setEnrollmentData: jest.fn(),
  resetEnrollment: jest.fn(),
  setEnrollmentModificationStep: jest.fn(),
  setEnrollmentModificationData: jest.fn(),
  resetEnrollmentModification: jest.fn(),
  setAuthStep: jest.fn(),
  setAuthData: jest.fn(),
  resetAuth: jest.fn(),
  setPrincipalCreateClassStep: jest.fn(),
  setPrincipalCreateClassData: jest.fn(),
  resetPrincipalCreateClass: jest.fn(),
};

// Context 모킹 - 무한 루프 방지
jest.mock('../forms/FormsContext', () => ({
  FormsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useForms: jest.fn(() => mockUseFormsValue),
}));

jest.mock('../navigation/NavigationContext', () => ({
  NavigationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useNavigation: jest.fn(() => ({
    activeTab: 0,
    navigationItems: [],
    setActiveTab: jest.fn(),
    handleTabChange: jest.fn(),
    canAccessTab: jest.fn(() => true),
  })),
}));

// Mock Next.js navigation
const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

let mockPathnameValue = '/dashboard/student/enroll';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => mockRouter),
  usePathname: jest.fn(() => mockPathnameValue),
}));

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

// Test component
const TestComponent = () => {
  const app = useApp();
  const [result, setResult] = React.useState<string>('');
  const [enrollmentStep, setEnrollmentStep] = React.useState('academy-selection');
  const [principalStep, setPrincipalStep] = React.useState('info');
  const [signupStep, setSignupStep] = React.useState('role-selection');
  const [selectedAcademyId, setSelectedAcademyId] = React.useState<number | null>(null);

  const handleGoBack = async () => {
    try {
      const success = await app.goBack();
      setResult(success ? 'go-back-success' : 'go-back-failed');
    } catch (_error) {
      setResult('go-back-error');
    }
  };

  const handleEnrollmentStep = () => {
    app.setEnrollmentStep('class-selection');
    setEnrollmentStep('class-selection');
    setResult('enrollment-step-changed');
  };

  const handleEnrollmentData = () => {
    app.setSelectedAcademyId(123);
    setSelectedAcademyId(123);
    setResult('enrollment-data-changed');
  };


  const handleCreateClassStep = () => {
    app.setPrincipalCreateClassStep('teacher');
    setPrincipalStep('teacher');
    setResult('principal-step-changed');
  };

  const handleSignupStep = () => {
    app.setSignupStep('personal-info');
    setSignupStep('personal-info');
    setResult('signup-step-changed');
  };

  return (
    <div>
      <button onClick={handleGoBack} data-testid="go-back-button">
        Go Back
      </button>
      <button onClick={handleEnrollmentStep} data-testid="enrollment-step-button">
        Change Enrollment Step
      </button>
      <button onClick={handleEnrollmentData} data-testid="enrollment-data-button">
        Change Enrollment Data
      </button>
      <button onClick={handleCreateClassStep} data-testid="principal-step-button">
        Change Principal Create Class Step
      </button>
      <button onClick={handleSignupStep} data-testid="signup-step-button">
        Change Signup Step
      </button>
      <div data-testid="result">{result}</div>
      <div data-testid="active-tab">{app.activeTab}</div>
      <div data-testid="enrollment-step">{enrollmentStep}</div>
      <div data-testid="enrollment-academy-id">{selectedAcademyId || 'null'}</div>
      <div data-testid="principal-step">{principalStep}</div>
      <div data-testid="signup-step">{signupStep}</div>
    </div>
  );
};

describe('AppContext', () => {
  it('should provide navigation context', () => {
    render(
      <SessionProvider session={mockSession}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </SessionProvider>
    );

    expect(screen.getByTestId('active-tab')).toHaveTextContent('0');
  });


  it('should handle enrollment form state changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Change enrollment step
    fireEvent.click(screen.getByTestId('enrollment-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('enrollment-step-changed');
      expect(screen.getByTestId('enrollment-step')).toHaveTextContent('class-selection');
    });

    // Change enrollment data
    fireEvent.click(screen.getByTestId('enrollment-data-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('enrollment-data-changed');
      expect(screen.getByTestId('enrollment-academy-id')).toHaveTextContent('123');
    });
  });

  it('should handle principal create class form state changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('principal-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('principal-step-changed');
      expect(screen.getByTestId('principal-step')).toHaveTextContent('teacher');
    });
  });

  it('should handle signup step changes', async () => {
    render(
      <SessionProvider session={mockSession}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </SessionProvider>
    );

    fireEvent.click(screen.getByTestId('signup-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('signup-step-changed');
      expect(screen.getByTestId('signup-step')).toHaveTextContent('personal-info');
    });
  });

  it('should handle goBack method', async () => {
    // Set pathname to a non-dashboard route so goBack returns true
    mockPathnameValue = '/dashboard/student/enroll';
    
    render(
      <SessionProvider session={mockSession}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Try to go back
    fireEvent.click(screen.getByTestId('go-back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('go-back-success');
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });

  it('should throw error when used outside provider', () => {
    // Mock console.error to avoid test output
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // When & Then
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useApp must be used within an AppProvider');

    consoleSpy.mockRestore();
  });

  it('should maintain state synchronization between contexts', async () => {
    // Set pathname to a non-dashboard route so goBack returns true
    mockPathnameValue = '/dashboard/student/enroll';
    
    render(
      <SessionProvider session={mockSession}>
        <AppProvider>
          <TestComponent />
        </AppProvider>
      </SessionProvider>
    );

    // Change enrollment step
    fireEvent.click(screen.getByTestId('enrollment-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('enrollment-step')).toHaveTextContent('class-selection');
    });

    // Go back should work correctly
    fireEvent.click(screen.getByTestId('go-back-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('go-back-success');
      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});
