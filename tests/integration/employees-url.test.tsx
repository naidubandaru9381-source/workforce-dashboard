import { fireEvent, render, screen } from "@testing-library/react";

import EmployeesPage from "@/app/(dashboard)/employees/page";

const mockPush = jest.fn();

let mockSearchParams = new URLSearchParams("page=2&pageSize=10&search=john");

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => mockSearchParams,
}));

jest.mock("@/components/ToastProvider", () => ({
    useToast: () => ({
        showToast: jest.fn(),
    }),
}));

jest.mock("@/features/auth/RoleGuard", () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/features/employees/employeeApi", () => ({
    useGetEmployeesQuery: () => ({
        data: {
            data: [],
            total: 0,
            page: 2,
            pageSize: 10,
            totalPages: 0,
        },
        isLoading: false,
        isError: false,
        error: undefined,
    }),
    useBulkUpdateStatusMutation: () => [jest.fn(), { isLoading: false }],
    useUpdateEmployeeMutation: () => [jest.fn(), { isLoading: false }],
}));

jest.mock("@/features/employees/hooks/useDebounce", () => ({
    useDebounce: (value: string) => value,
}));

jest.mock("@/features/employees/EmployeeInfiniteList", () => ({
    __esModule: true,
    default: () => <div>Infinite list</div>,
}));

jest.mock("@/components/employees/EditEmployeePanel", () => ({
    __esModule: true,
    default: () => null,
}));

describe("EmployeesPage URL-synced filters", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockSearchParams = new URLSearchParams(
            "page=2&pageSize=10&search=john",
        );
    });

    it("updates the URL when the department filter changes", () => {
        render(<EmployeesPage />);

        const departmentSelect = screen.getByLabelText("Department");

        fireEvent.change(departmentSelect, {
            target: {
                value: "Engineering",
            },
        });

        expect(mockPush).toHaveBeenCalledWith(
            expect.stringContaining("/employees?"),
        );

        const pushedUrl = mockPush.mock.calls[0][0] as string;

        const queryString = pushedUrl.split("?")[1];

        const params = new URLSearchParams(queryString);

        expect(params.get("department")).toBe("Engineering");

        expect(params.get("page")).toBe("1");

        expect(params.get("pageSize")).toBe("10");

        expect(params.get("search")).toBe("john");
    });
});
