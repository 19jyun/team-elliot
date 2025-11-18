import { http, HttpResponse } from 'msw';
import { server } from '@/__mocks__/server';
import { screen, act, render } from '@/__tests__/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { EnrollmentMainStep } from '@/components/dashboard/student/Enrollment/EnrollmentMainStep';
import { EnrollmentFormManager } from '@/contexts/forms/EnrollmentFormManager';

// NextAuth mock
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(() => ({ 
    data: { 
      user: { id: "1", userId: "testuser", name: "Test User", role: "STUDENT" },
      accessToken: "mock-token" 
    }, 
    status: "authenticated" 
  })),
  getSession: jest.fn(() => Promise.resolve({ 
    user: { id: "1", userId: "testuser", name: "Test User", role: "STUDENT" },
    accessToken: "mock-token" 
  })),
}));

// Next.js router mock
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    back: mockBack,
  })),
}));

jest.mock("@/contexts/navigation/NavigationContext", () => ({
  useNavigation: jest.fn(() => ({
    activeTab: 1,
    navigationItems: [
      { label: "클래스 정보", href: "/dashboard/student", index: 0 },
      { label: "수강신청", href: "/dashboard/student", index: 1 },
      { label: "나의 정보", href: "/dashboard/student", index: 2 },
    ],
    setActiveTab: jest.fn(),
    handleTabChange: jest.fn(),
    canAccessTab: jest.fn(() => true),
  })),
  NavigationProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/contexts/forms/FormsContext", () => ({
  useForms: jest.fn(() => ({
    forms: {
      enrollment: {
        currentStep: "academy-selection",
        selectedAcademyId: null,
        selectedClassIds: [],
        selectedSessions: [],
        selectedClasses: [],
        selectedClassesWithSessions: [],
        selectedMonth: null,
      },
      createClass: {
        currentStep: "class-info",
        classFormData: {
          name: "",
          description: "",
          maxStudents: 0,
          price: 0,
          duration: 0,
          difficulty: "BEGINNER",
          category: "BALLET",
        },
        selectedTeacherId: null,
      },
      auth: {
        authMode: "login",
        authSubPage: null,
        signup: {
          step: "personal",
          role: "STUDENT",
          personalInfo: {
            name: "",
            phoneNumber: "",
            birthDate: "",
            gender: "",
          },
          accountInfo: {
            email: "",
            password: "",
            confirmPassword: "",
          },
          terms: {
            privacy: false,
            service: false,
            marketing: false,
          },
        },
        login: {
          email: "",
          password: "",
        },
      },
      personManagement: {
        currentStep: "class-selection",
        selectedTab: "enrollment",
        selectedClassId: null,
        selectedSessionId: null,
        selectedRequestId: null,
        selectedRequestType: null,
      },
      principalCreateClass: {
        currentStep: "class-info",
        classFormData: {
          name: "",
          description: "",
          maxStudents: 0,
          price: 0,
          duration: 0,
          difficulty: "BEGINNER",
          category: "BALLET",
        },
        selectedTeacherId: null,
      },
      principalPersonManagement: {
        currentStep: "class-selection",
        selectedTab: "enrollment",
        selectedClassId: null,
        selectedSessionId: null,
        selectedRequestId: null,
        selectedRequestType: null,
      },
    },
    enrollment: {
      currentStep: "academy-selection",
      selectedAcademyId: null,
      selectedClassIds: [],
      selectedSessions: [],
      selectedClasses: [],
      selectedClassesWithSessions: [],
      selectedMonth: null,
    },
    enrollmentModification: {
      currentStep: "date-selection",
      modificationData: null,
    },
    createClass: {
      currentStep: "class-info",
      classFormData: {
        name: "",
        description: "",
        maxStudents: 0,
        price: 0,
        duration: 0,
        difficulty: "BEGINNER",
        category: "BALLET",
      },
      selectedTeacherId: null,
    },
    auth: {
      authMode: "login",
      authSubPage: null,
      signup: {
        step: "personal",
        role: "STUDENT",
        personalInfo: {
          name: "",
          phoneNumber: "",
          birthDate: "",
          gender: "",
        },
        accountInfo: {
          email: "",
          password: "",
          confirmPassword: "",
        },
        terms: {
          privacy: false,
          service: false,
          marketing: false,
        },
      },
      login: {
        email: "",
        password: "",
      },
    },
    personManagement: {
      currentStep: "class-selection",
      selectedTab: "enrollment",
      selectedClassId: null,
      selectedSessionId: null,
      selectedRequestId: null,
      selectedRequestType: null,
    },
    principalCreateClass: {
      currentStep: "class-info",
      classFormData: {
        name: "",
        description: "",
        maxStudents: 0,
        price: 0,
        duration: 0,
        difficulty: "BEGINNER",
        category: "BALLET",
      },
      selectedTeacherId: null,
    },
    principalPersonManagement: {
      currentStep: "class-selection",
      selectedTab: "enrollment",
      selectedClassId: null,
      selectedSessionId: null,
      selectedRequestId: null,
      selectedRequestType: null,
    },
    updateForm: jest.fn(),
    setEnrollmentStep: jest.fn(),
    setEnrollmentData: jest.fn(),
    resetEnrollment: jest.fn(),
    setEnrollmentModificationStep: jest.fn(),
    setEnrollmentModificationData: jest.fn(),
    resetEnrollmentModification: jest.fn(),
    setCreateClassStep: jest.fn(),
    setCreateClassData: jest.fn(),
    resetCreateClass: jest.fn(),
    setAuthMode: jest.fn(),
    setAuthStep: jest.fn(),
    setAuthData: jest.fn(),
    resetAuth: jest.fn(),
    setPersonManagementStep: jest.fn(),
    setPersonManagementData: jest.fn(),
    resetPersonManagement: jest.fn(),
    setPrincipalCreateClassStep: jest.fn(),
    setPrincipalCreateClassData: jest.fn(),
    resetPrincipalCreateClass: jest.fn(),
    setPrincipalPersonManagementStep: jest.fn(),
    setPrincipalPersonManagementData: jest.fn(),
    resetPrincipalPersonManagement: jest.fn(),
    switchPrincipalPersonManagementTab: jest.fn(),
    resetAllForms: jest.fn(),
    getFormState: jest.fn(),
  })),
  FormsProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/contexts/AppContext", () => ({
  useApp: jest.fn(() => ({
    // 새로운 구조
    navigation: {
      activeTab: 1,
      navigationItems: [
        { label: "클래스 정보", href: "/dashboard/student", index: 0 },
        { label: "수강신청", href: "/dashboard/student", index: 1 },
        { label: "나의 정보", href: "/dashboard/student", index: 2 },
      ],
      setActiveTab: jest.fn(),
      handleTabChange: jest.fn(),
      canAccessTab: jest.fn(() => true),
    },
    forms: {
      forms: {
        enrollment: {
          currentStep: "academy-selection",
          selectedAcademyId: null,
          selectedClassIds: [],
          selectedSessions: [],
          selectedClasses: [],
          selectedClassesWithSessions: [],
          selectedMonth: null,
        },
      },
      enrollment: {
        currentStep: "academy-selection",
        selectedAcademyId: null,
        selectedClassIds: [],
        selectedSessions: [],
        selectedClasses: [],
        selectedClassesWithSessions: [],
        selectedMonth: null,
      },
      updateForm: jest.fn(),
      setEnrollmentStep: jest.fn(),
      setEnrollmentData: jest.fn(),
      resetEnrollment: jest.fn(),
    },
    ui: {
      isLoading: false,
      setIsLoading: jest.fn(),
      showModal: jest.fn(),
      hideModal: jest.fn(),
      showToast: jest.fn(),
      hideToast: jest.fn(),
    },
    data: {
      academies: [],
      classes: [],
      teachers: [],
      students: [],
      sessions: [],
      setAcademies: jest.fn(),
      setClasses: jest.fn(),
      setTeachers: jest.fn(),
      setStudents: jest.fn(),
      setSessions: jest.fn(),
    },
    session: {
      data: {
        user: { id: "1", userId: "testuser", name: "Test User", role: "STUDENT" },
        accessToken: "mock-token"
      },
      status: "authenticated"
    },
    goBack: jest.fn(),
    updateForm: jest.fn(),
    resetAllForms: jest.fn(),
    getFormState: jest.fn(),
    
    // 하위 호환성을 위한 직접 접근
    activeTab: 1,
    navigationItems: [
      { label: "클래스 정보", href: "/dashboard/student", index: 0 },
      { label: "수강신청", href: "/dashboard/student", index: 1 },
      { label: "나의 정보", href: "/dashboard/student", index: 2 },
    ],
    setActiveTab: jest.fn(),
    handleTabChange: jest.fn(),
    
    // 하위 호환성을 위한 폼 접근
    form: {
      enrollment: {
        currentStep: "academy-selection",
        selectedAcademyId: null,
        selectedClassIds: [],
        selectedSessions: [],
        selectedClasses: [],
        selectedClassesWithSessions: [],
        selectedMonth: null,
      },
      createClass: {
        currentStep: "class-info",
        classFormData: {
          name: "",
          description: "",
          maxStudents: 0,
          price: 0,
          duration: 0,
          difficulty: "BEGINNER",
          category: "BALLET",
        },
        selectedTeacherId: null,
      },
      principalCreateClass: {
        currentStep: "class-info",
        classFormData: {
          name: "",
          description: "",
          maxStudents: 0,
          price: 0,
          duration: 0,
          difficulty: "BEGINNER",
          category: "BALLET",
        },
        selectedTeacherId: null,
      },
      auth: {
        authMode: "login",
        authSubPage: null,
        signup: {
          step: "personal",
          role: "STUDENT",
          personalInfo: {
            name: "",
            phoneNumber: "",
            birthDate: "",
            gender: "",
          },
          accountInfo: {
            email: "",
            password: "",
            confirmPassword: "",
          },
          terms: {
            privacy: false,
            service: false,
            marketing: false,
          },
        },
        login: {
          email: "",
          password: "",
        },
      },
      personManagement: {
        currentStep: "class-selection",
        selectedTab: "enrollment",
        selectedClassId: null,
        selectedSessionId: null,
        selectedRequestId: null,
        selectedRequestType: null,
      },
      principalPersonManagement: {
        currentStep: "class-selection",
        selectedTab: "enrollment",
        selectedClassId: null,
        selectedSessionId: null,
        selectedRequestId: null,
        selectedRequestType: null,
      },
    },
    
    // 하위 호환성을 위한 직접 메서드들
    setEnrollmentStep: jest.fn(),
    setSelectedMonth: jest.fn(),
    setSelectedClasses: jest.fn(),
    setSelectedSessions: jest.fn(),
    setSelectedClassIds: jest.fn(),
    setSelectedAcademyId: jest.fn(),
    setSelectedClassesWithSessions: jest.fn(),
    resetEnrollment: jest.fn(),
    setCreateClassStep: jest.fn(),
    setClassFormData: jest.fn(),
    setSelectedTeacherId: jest.fn(),
    resetCreateClass: jest.fn(),
    setPrincipalCreateClassStep: jest.fn(),
    setPrincipalClassFormData: jest.fn(),
    setPrincipalSelectedTeacherId: jest.fn(),
    resetPrincipalCreateClass: jest.fn(),
    setAuthMode: jest.fn(),
    setAuthSubPage: jest.fn(),
    navigateToAuthSubPage: jest.fn(),
    goBackFromAuth: jest.fn(),
    clearAuthSubPage: jest.fn(),
    setSignupStep: jest.fn(),
    setRole: jest.fn(),
    setPersonalInfo: jest.fn(),
    setAccountInfo: jest.fn(),
    setTerms: jest.fn(),
    resetSignup: jest.fn(),
    setLoginInfo: jest.fn(),
    resetLogin: jest.fn(),
    setPersonManagementStep: jest.fn(),
    setPersonManagementTab: jest.fn(),
    setSelectedClassId: jest.fn(),
    setSelectedSessionId: jest.fn(),
    setSelectedRequestId: jest.fn(),
    setSelectedRequestType: jest.fn(),
    resetPersonManagement: jest.fn(),
    setPrincipalPersonManagementStep: jest.fn(),
    setPrincipalPersonManagementTab: jest.fn(),
    setPrincipalSelectedClassId: jest.fn(),
    setPrincipalSelectedSessionId: jest.fn(),
    setPrincipalSelectedRequestId: jest.fn(),
    setPrincipalSelectedRequestType: jest.fn(),
    resetPrincipalPersonManagement: jest.fn(),
    switchPrincipalPersonManagementTab: jest.fn(),
  })),
  AppProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// React Query hooks mock
const mockEnrollSessions = jest.fn();

// useStudentAcademies mock
jest.mock("@/hooks/queries/student/useStudentAcademies", () => ({
  useStudentAcademies: jest.fn(() => ({
    data: [
      {
        id: 1,
        name: "Test Academy",
        address: "Test Address",
        phoneNumber: "010-1234-5678",
        description: "Test Academy Description",
        isJoined: true,
      }
    ],
    isLoading: false,
    error: null,
  })),
}));

// useEnrollment mock
jest.mock("@/hooks/student/useEnrollment", () => ({
  useEnrollment: jest.fn(() => ({
    enrollSessions: mockEnrollSessions,
    isLoading: false,
  })),
}));

describe('Student Enrollment Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    mockBack.mockClear();
    mockEnrollSessions.mockClear();
    
    // EnrollmentFormManager의 setCurrentStep을 더 효율적으로 모킹
    jest.spyOn(EnrollmentFormManager.prototype, 'setCurrentStep').mockImplementation(function(this: EnrollmentFormManager, step) {
      // canNavigateToStep 검증을 우회하고 직접 단계 변경
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).state.currentStep = step;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).notifyListeners();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any).emitStateChange();
    });
  });

  afterEach(() => {
    // 각 테스트 후 모킹 정리
    jest.restoreAllMocks();
  });

  it('should render enrollment main step and navigate to academy selection', async () => {
    const user = userEvent.setup();
    
    // mockEnrollSessions를 성공 응답으로 설정
    mockEnrollSessions.mockResolvedValue({
      data: {
        success: true,
        message: "수강신청이 완료되었습니다.",
        enrolledSessions: [1],
        failedSessions: [],
      }
    });

    // MSW 핸들러 설정
    server.use(
      http.post('/api/class-sessions/enrollments/bulk', () => {
        return HttpResponse.json({
          success: true,
          data: {
            success: true,
            message: "수강신청이 완료되었습니다.",
            enrolledSessions: [1],
            failedSessions: [],
          }
        });
      })
    );

    render(<EnrollmentMainStep />);

    // 수강신청 메인 화면 확인
    expect(screen.getByText('수강신청')).toBeInTheDocument();
    expect(screen.getByText(/원하는 클래스를 선택하고/)).toBeInTheDocument();
    expect(screen.getByText(/수강할 세션을 신청하세요/)).toBeInTheDocument();

    // 수강신청 카드 클릭
    const enrollmentCard = screen.getByText('수강신청').closest('div');
    if (enrollmentCard) {
      await act(async () => {
        await user.click(enrollmentCard);
      });
      
      // 라우터 push가 호출되었는지 확인
      expect(mockPush).toHaveBeenCalledWith('/dashboard/student/enroll/academy/');
    }
  });

  it('should render enrollment main step correctly', () => {
    render(<EnrollmentMainStep />);

    // 수강신청 메인 화면 확인
    expect(screen.getByText('수강신청')).toBeInTheDocument();
    expect(screen.getByText('공지사항')).toBeInTheDocument();
    expect(screen.getByText('수강신청 안내')).toBeInTheDocument();
    expect(screen.getByText(/원하는 클래스를 선택해주세요/)).toBeInTheDocument();
  });

  it('should display all required elements', () => {
    render(<EnrollmentMainStep />);

    // 모든 필수 요소 확인
    expect(screen.getByText('수강신청')).toBeInTheDocument();
    expect(screen.getByText(/원하는 클래스를 선택하고/)).toBeInTheDocument();
    expect(screen.getByText(/수강할 세션을 신청하세요/)).toBeInTheDocument();
    expect(screen.getByText('공지사항')).toBeInTheDocument();
    expect(screen.getByText('수강신청 안내')).toBeInTheDocument();
  });
});
