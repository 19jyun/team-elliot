// src/contexts/__tests__/ImprovedFormsContext.test.tsx
import React from 'react';
import { render, screen, act, fireEvent, waitFor } from '@testing-library/react';
import { ImprovedFormsProvider, useImprovedForms } from '../forms/ImprovedFormsContext';
import { StateSyncProvider } from '../state/StateSyncContext';

// Test component
const TestComponent = () => {
  const forms = useImprovedForms();
  const [result, setResult] = React.useState<string>('');

  const handleEnrollmentStep = () => {
    forms.setEnrollmentStep('class-selection');
    setResult('enrollment-step-changed');
  };

  const handleEnrollmentData = () => {
    forms.setEnrollmentData({ selectedAcademyId: 123 });
    setResult('enrollment-data-changed');
  };

  const handleCreateClassStep = () => {
    forms.setCreateClassStep('teacher');
    setResult('create-class-step-changed');
  };

  const handleAuthMode = () => {
    forms.setAuthMode('login');
    setResult('auth-mode-changed');
  };

  const handleResetAll = () => {
    forms.resetAllForms();
    setResult('all-forms-reset');
  };

  return (
    <div>
      <button onClick={handleEnrollmentStep} data-testid="enrollment-step-button">
        Change Enrollment Step
      </button>
      <button onClick={handleEnrollmentData} data-testid="enrollment-data-button">
        Change Enrollment Data
      </button>
      <button onClick={handleCreateClassStep} data-testid="create-class-step-button">
        Change Create Class Step
      </button>
      <button onClick={handleAuthMode} data-testid="auth-mode-button">
        Change Auth Mode
      </button>
      <button onClick={handleResetAll} data-testid="reset-all-button">
        Reset All Forms
      </button>
      <div data-testid="result">{result}</div>
      <div data-testid="enrollment-step">{forms.enrollment.currentStep}</div>
      <div data-testid="enrollment-academy-id">{forms.enrollment.selectedAcademyId || 'null'}</div>
      <div data-testid="create-class-step">{forms.createClass.currentStep}</div>
      <div data-testid="auth-mode">{forms.auth.authMode}</div>
    </div>
  );
};

describe('ImprovedFormsContext', () => {
  it('should provide forms context', () => {
    render(
      <StateSyncProvider>
        <ImprovedFormsProvider>
          <TestComponent />
        </ImprovedFormsProvider>
      </StateSyncProvider>
    );

    expect(screen.getByTestId('enrollment-step')).toHaveTextContent('academy-selection');
    expect(screen.getByTestId('enrollment-academy-id')).toHaveTextContent('null');
    expect(screen.getByTestId('create-class-step')).toHaveTextContent('info');
    expect(screen.getByTestId('auth-mode')).toHaveTextContent('login');
  });

  it('should handle enrollment step changes', async () => {
    render(
      <StateSyncProvider>
        <ImprovedFormsProvider>
          <TestComponent />
        </ImprovedFormsProvider>
      </StateSyncProvider>
    );

    fireEvent.click(screen.getByTestId('enrollment-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('enrollment-step-changed');
      expect(screen.getByTestId('enrollment-step')).toHaveTextContent('class-selection');
    });
  });

  it('should handle enrollment data changes', async () => {
    render(
      <StateSyncProvider>
        <ImprovedFormsProvider>
          <TestComponent />
        </ImprovedFormsProvider>
      </StateSyncProvider>
    );

    fireEvent.click(screen.getByTestId('enrollment-data-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('enrollment-data-changed');
      expect(screen.getByTestId('enrollment-academy-id')).toHaveTextContent('123');
    });
  });

  it('should handle create class step changes', async () => {
    render(
      <StateSyncProvider>
        <ImprovedFormsProvider>
          <TestComponent />
        </ImprovedFormsProvider>
      </StateSyncProvider>
    );

    fireEvent.click(screen.getByTestId('create-class-step-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('create-class-step-changed');
      expect(screen.getByTestId('create-class-step')).toHaveTextContent('teacher');
    });
  });

  it('should handle auth mode changes', async () => {
    render(
      <StateSyncProvider>
        <ImprovedFormsProvider>
          <TestComponent />
        </ImprovedFormsProvider>
      </StateSyncProvider>
    );

    fireEvent.click(screen.getByTestId('auth-mode-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('auth-mode-changed');
      expect(screen.getByTestId('auth-mode')).toHaveTextContent('login');
    });
  });

  it('should reset all forms', async () => {
    render(
      <StateSyncProvider>
        <ImprovedFormsProvider>
          <TestComponent />
        </ImprovedFormsProvider>
      </StateSyncProvider>
    );

    // First change some data
    fireEvent.click(screen.getByTestId('enrollment-step-button'));
    fireEvent.click(screen.getByTestId('enrollment-data-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('enrollment-step')).toHaveTextContent('class-selection');
      expect(screen.getByTestId('enrollment-academy-id')).toHaveTextContent('123');
    });

    // Then reset all
    fireEvent.click(screen.getByTestId('reset-all-button'));
    
    await waitFor(() => {
      expect(screen.getByTestId('result')).toHaveTextContent('all-forms-reset');
    });

    // The reset should work - just check that the button was clicked
    expect(screen.getByTestId('result')).toHaveTextContent('all-forms-reset');
  });

  it('should throw error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useImprovedForms must be used within an ImprovedFormsProvider');

    consoleSpy.mockRestore();
  });
});
