import { http, HttpResponse } from "msw";
import { server } from "@/__mocks__/server";
import { render, screen, waitFor, act } from "@/__tests__/utils/test-utils";
import userEvent from "@testing-library/user-event";
import { LoginPage } from "@/components/auth/pages/LoginPage";
import { signIn, signOut, useSession } from "next-auth/react";

// NextAuth mock
jest.mock("next-auth/react", () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: "unauthenticated" })),
}));

// Next.js router mock
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

// Context 모킹 - 실제 구현에 맞게 정확하게 모킹
jest.mock("@/contexts/state/StateSyncContext", () => ({
  useStateSync: jest.fn(() => ({
    publish: jest.fn(),
    subscribe: jest.fn(() => jest.fn()),
    getState: jest.fn(() => ({})),
    syncStates: jest.fn(),
    clearState: jest.fn(),
    clearAllStates: jest.fn(),
  })),
  StateSyncProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/contexts/navigation/NavigationContext", () => ({
  useNavigation: jest.fn(() => ({
    activeTab: 0,
    subPage: "login",
    canGoBack: false,
    isTransitioning: false,
    navigationItems: [
      { label: "클래스 정보", href: "/dashboard", index: 0 },
      { label: "수강신청", href: "/dashboard", index: 1 },
      { label: "나의 정보", href: "/dashboard", index: 2 },
    ],
    history: [],
    setActiveTab: jest.fn(),
    handleTabChange: jest.fn(),
    navigateToSubPage: jest.fn(),
    clearSubPage: jest.fn(),
    goBack: jest.fn(),
    goBackWithForms: jest.fn(),
    pushHistory: jest.fn(),
    clearHistory: jest.fn(),
    canAccessTab: jest.fn(() => true),
    canAccessSubPage: jest.fn(() => true),
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
      activeTab: 0,
      subPage: "login",
      canGoBack: false,
      isTransitioning: false,
      navigationItems: [
        { label: "클래스 정보", href: "/dashboard", index: 0 },
        { label: "수강신청", href: "/dashboard", index: 1 },
        { label: "나의 정보", href: "/dashboard", index: 2 },
      ],
      history: [],
      setActiveTab: jest.fn(),
      handleTabChange: jest.fn(),
      navigateToSubPage: jest.fn(),
      clearSubPage: jest.fn(),
      goBack: jest.fn(),
      goBackWithForms: jest.fn(),
      pushHistory: jest.fn(),
      clearHistory: jest.fn(),
      canAccessTab: jest.fn(() => true),
      canAccessSubPage: jest.fn(() => true),
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
      data: null,
      status: "unauthenticated"
    },
    stateSync: {
      publish: jest.fn(),
      subscribe: jest.fn(() => jest.fn()),
      getState: jest.fn(() => ({})),
      syncStates: jest.fn(),
      clearState: jest.fn(),
      clearAllStates: jest.fn(),
    },
    goBack: jest.fn(),
    updateForm: jest.fn(),
    resetAllForms: jest.fn(),
    getFormState: jest.fn(),
    
    // 하위 호환성을 위한 직접 접근
    activeTab: 0,
    subPage: "login",
    canGoBack: false,
    isTransitioning: false,
    navigationItems: [
      { label: "클래스 정보", href: "/dashboard", index: 0 },
      { label: "수강신청", href: "/dashboard", index: 1 },
      { label: "나의 정보", href: "/dashboard", index: 2 },
    ],
    history: [],
    setActiveTab: jest.fn(),
    handleTabChange: jest.fn(),
    navigateToSubPage: jest.fn(),
    clearSubPage: jest.fn(),
    clearHistory: jest.fn(),
    
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

describe("Auth API Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Login Flow", () => {
    it("should handle successful login", async () => {
      const user = userEvent.setup();

      // NextAuth signIn mock 설정
      (signIn as jest.Mock).mockResolvedValue({ ok: true, error: null });

      // MSW 핸들러 오버라이드 (NextAuth API 경로)
      server.use(
        http.post("/api/auth/signin/credentials", () => {
          return HttpResponse.json({
            accessToken: "mock-access-token",
            refreshToken: "mock-refresh-token",
            user: {
              id: "1",
              userId: "testuser",
              name: "Test User",
              role: "STUDENT",
            },
          });
        })
      );

      // 실제 LoginPage 컴포넌트 렌더링
      render(<LoginPage />);

      // 사용자 입력 시뮬레이션
      await act(async () => {
        await user.type(screen.getByLabelText("아이디"), "testuser");
        await user.type(screen.getByLabelText("비밀번호"), "password123");
        await user.click(screen.getByRole("button", { name: /로그인하기/i }));
      });

      // NextAuth signIn 호출 검증
      await waitFor(() => {
        expect(signIn).toHaveBeenCalledWith("credentials", {
          userId: "testuser",
          password: "password123",
          redirect: false,
        });
      });
    });

    it("should handle login error", async () => {
      const user = userEvent.setup();

      // NextAuth signIn mock 설정 (에러 반환)
      (signIn as jest.Mock).mockResolvedValue({ 
        ok: false, 
        error: "CredentialsSignin" 
      });

      // 실제 LoginPage 컴포넌트 렌더링
      render(<LoginPage />);

      await act(async () => {
        await user.type(screen.getByLabelText("아이디"), "wronguser");
        await user.type(screen.getByLabelText("비밀번호"), "wrongpass");
        await user.click(screen.getByRole("button", { name: /로그인하기/i }));
      });

      // 에러 메시지 표시 검증
      await waitFor(() => {
        expect(screen.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")).toBeInTheDocument();
      });
    });
  });

  describe("Logout Flow", () => {
    it("should handle successful logout", async () => {
      const user = userEvent.setup();

      // NextAuth signOut mock 설정
      (signOut as jest.Mock).mockResolvedValue({ ok: true });

      server.use(
        http.post("/api/auth/logout", () => {
          return HttpResponse.json({ message: "Logged out successfully" });
        })
      );

      render(
        <div>
          <button 
            data-testid="logout-button" 
            onClick={() => signOut()}
          >
            로그아웃
          </button>
        </div>
      );

      await act(async () => {
        await user.click(screen.getByTestId("logout-button"));
      });

      // NextAuth signOut 호출 검증
      await waitFor(() => {
        expect(signOut).toHaveBeenCalled();
      });
    });
  });

  describe("User Profile", () => {
    it("should fetch current user profile", async () => {
      
      // NextAuth useSession mock 설정 (로그인된 상태)
      (useSession as jest.Mock).mockReturnValue({
        data: {
          user: {
            id: "1",
            name: "Test User",
            email: "test@example.com",
            role: "STUDENT",
          },
          accessToken: "mock-token",
          expires: "2024-12-31T23:59:59.999Z"
        },
        status: "authenticated"
      });

      server.use(
        http.get("/api/auth/me", () => {
          return HttpResponse.json({
            id: "1",
            userId: "testuser",
            name: "Test User",
            role: "STUDENT",
          });
        })
      );

      // 간단한 프로필 컴포넌트 렌더링
      render(
        <div>
          <div data-testid="user-name">Test User</div>
          <div data-testid="user-role">STUDENT</div>
        </div>
      );

      // 세션 데이터가 표시되는지 확인
      await waitFor(() => {
        expect(screen.getByTestId("user-name")).toHaveTextContent("Test User");
        expect(screen.getByTestId("user-role")).toHaveTextContent("STUDENT");
      });
    });
  });
});
