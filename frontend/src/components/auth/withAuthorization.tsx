import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthorization } from '@/hooks/useAuthorization';
import { Permission } from '@/types/auth';

interface AuthorizationErrorProps {
  message: string;
}

const AuthorizationError = ({ message }: AuthorizationErrorProps) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <h2 className="text-2xl font-bold text-red-600 mb-4">접근 권한 없음</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={() => window.history.back()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        이전 페이지로 돌아가기
      </button>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

export function withAuthorization(
  WrappedComponent: React.ComponentType,
  requiredPermissions: Permission[],
  options: {
    redirectTo?: string;
    showError?: boolean;
  } = {},
) {
  return function WithAuthorizationComponent<T extends Record<string, unknown>>(props: T) {
    const {
      hasAllPermissions,
      isAuthenticated,
      isLoading,
      getAuthorizationError,
    } = useAuthorization();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth');
        return;
      }

      if (!isLoading && !hasAllPermissions(requiredPermissions)) {
        if (options.redirectTo) {
          router.push(options.redirectTo);
        }
      }
    }, [isLoading, isAuthenticated, hasAllPermissions, router]);

    if (isLoading) {
      return <LoadingSpinner />;
    }

    if (!isAuthenticated) {
      return null; // 로그인 페이지로 리다이렉트 중
    }

    if (!hasAllPermissions(requiredPermissions)) {
      if (options.showError) {
        const error = getAuthorizationError(requiredPermissions[0]);
        return <AuthorizationError message={error || '접근 권한이 없습니다.'} />;
      }
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
