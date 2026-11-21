import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import ToastProvider from "@/components/ToastProvider";
import EmployeesPage from "@/app/(dashboard)/employees/page";

function renderEmployeesPage() {
    return render(
        <ToastProvider>
            <EmployeesPage />
        </ToastProvider>,
    );
}

const mockPush = jest.fn();

const mockSearchParams = new URLSearchParams();

const mockEmployees = [
    {
        id: "emp-1",
        employeeId: "EMP001",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        department: "Engineering",
        designation: "Frontend Developer",
        status: "active",
        joinDate: "2025-01-15",
    },
    {
        id: "emp-2",
        employeeId: "EMP002",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        department: "Product",
        designation: "Product Manager",
        status: "inactive",
        joinDate: "2025-02-20",
    },
];

const mockGetEmployees = jest.fn();
const mockBulkUpdateStatus = jest.fn();
const mockUpdateEmployee = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
    }),

    useSearchParams: () => ({
        get: (key: string) => mockSearchParams.get(key),
        toString: () => mockSearchParams.toString(),
    }),
}));

jest.mock("@/features/auth/RoleGuard", () => ({
    __esModule: true,

    default: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock("@/features/employees/hooks/useDebounce", () => ({
    useDebounce: (value: string) => value,
}));

jest.mock("@/features/employees/employeeApi", () => ({
    useGetEmployeesQuery: (...args: unknown[]) => {
        mockGetEmployees(...args);

        return {
            data: {
                data: mockEmployees,
                total: 2,
                page: 1,
                totalPages: 2,
            },

            isLoading: false,
            isError: false,
            error: undefined,
        };
    },

    useBulkUpdateStatusMutation: () => [
        mockBulkUpdateStatus,
        {
            isLoading: false,
        },
    ],

    useUpdateEmployeeMutation: () => [
        mockUpdateEmployee,
        {
            isLoading: false,
        },
    ],
}));

jest.mock("@/components/employees/EditEmployeePanel", () => ({
    __esModule: true,
    default: () => null,
}));

describe("EmployeesPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockSearchParams.delete("page");
        mockSearchParams.delete("pageSize");
        mockSearchParams.delete("search");
        mockSearchParams.delete("department");
        mockSearchParams.delete("status");
        mockSearchParams.delete("joinDateFrom");
        mockSearchParams.delete("joinDateTo");
        mockSearchParams.delete("sort");

        mockBulkUpdateStatus.mockReset();
        mockUpdateEmployee.mockReset();

        mockBulkUpdateStatus.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({
                results: [],
            }),
        });

        mockUpdateEmployee.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({}),
        });
    });

    it("renders the employee directory", () => {
        renderEmployeesPage();

        expect(
            screen.getByRole("heading", {
                name: "Employees",
            }),
        ).toBeInTheDocument();

        expect(screen.getByLabelText("Search employees")).toBeInTheDocument();

        expect(screen.getByLabelText("Department")).toBeInTheDocument();

        expect(screen.getByLabelText("Status")).toBeInTheDocument();
    });

    it("renders employee data from the API", () => {
        renderEmployeesPage();

        expect(screen.getAllByText("John Doe").length).toBeGreaterThan(0);

        expect(screen.getAllByText("Jane Smith").length).toBeGreaterThan(0);

        expect(screen.getAllByText("john@example.com").length).toBeGreaterThan(
            0,
        );

        expect(screen.getAllByText("Engineering").length).toBeGreaterThan(0);
    });

    it("updates the URL when searching for an employee", async () => {
        renderEmployeesPage();

        const searchInput = screen.getByLabelText("Search employees");

        fireEvent.change(searchInput, {
            target: {
                value: "John",
            },
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?page=1&search=John",
            );
        });
    });

    it("updates the URL when department filter changes", async () => {
        renderEmployeesPage();

        fireEvent.change(screen.getByLabelText("Department"), {
            target: {
                value: "Engineering",
            },
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?page=1&department=Engineering",
            );
        });
    });

    it("updates the URL when status filter changes", async () => {
        renderEmployeesPage();

        fireEvent.change(screen.getByLabelText("Status"), {
            target: {
                value: "active",
            },
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?page=1&status=active",
            );
        });
    });

    it("resets pagination to page 1 when a filter changes", async () => {
        mockSearchParams.set("page", "4");

        renderEmployeesPage();

        fireEvent.change(screen.getByLabelText("Department"), {
            target: {
                value: "Engineering",
            },
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?page=1&department=Engineering",
            );
        });
    });

    it("updates the URL when join date range changes", async () => {
        renderEmployeesPage();

        fireEvent.change(screen.getByLabelText("Join Date From"), {
            target: {
                value: "2025-01-01",
            },
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?page=1&joinDateFrom=2025-01-01",
            );
        });
    });

    it("moves to the next page", async () => {
        renderEmployeesPage();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Next",
            }),
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?page=2&pageSize=10",
            );
        });
    });

    it("updates sorting when a column header is clicked", async () => {
        renderEmployeesPage();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sort by Department",
            }),
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?page=1&sort=firstName%3Aasc%2Cdepartment%3Aasc",
            );
        });
    });

    it("toggles an existing sort from ascending to descending", async () => {
        mockSearchParams.set("sort", "firstName:asc,department:asc");

        renderEmployeesPage();

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sort by Department",
            }),
        );

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(
                "/employees?sort=firstName%3Aasc%2Cdepartment%3Adesc&page=1",
            );
        });
    });

    it("selects an employee", () => {
        renderEmployeesPage();

        const checkboxes = screen.getAllByRole("checkbox", {
            name: "Select John Doe",
        });

        expect(checkboxes).toHaveLength(2);

        expect(checkboxes[0]).not.toBeChecked();

        fireEvent.click(checkboxes[0]);

        expect(checkboxes[0]).toBeChecked();
    });

    it("selects all employees on the current page", () => {
        renderEmployeesPage();

        const selectAllCheckbox = screen.getByRole("checkbox", {
            name: "Select all employees on this page",
        });

        fireEvent.click(selectAllCheckbox);

        const johnCheckboxes = screen.getAllByRole("checkbox", {
            name: "Select John Doe",
        });

        const janeCheckboxes = screen.getAllByRole("checkbox", {
            name: "Select Jane Smith",
        });

        expect(johnCheckboxes).toHaveLength(2);

        expect(janeCheckboxes).toHaveLength(2);

        expect(johnCheckboxes[0]).toBeChecked();
        expect(johnCheckboxes[1]).toBeChecked();

        expect(janeCheckboxes[0]).toBeChecked();
        expect(janeCheckboxes[1]).toBeChecked();
    });

    it("shows the bulk deactivate action when an employee is selected", () => {
        renderEmployeesPage();

        const johnCheckboxes = screen.getAllByRole("checkbox", {
            name: "Select John Doe",
        });

        fireEvent.click(johnCheckboxes[0]);

        expect(
            screen.getByRole("button", {
                name: "Deactivate Selected",
            }),
        ).toBeInTheDocument();
    });

    it("bulk deactivates selected employees", async () => {
        renderEmployeesPage();

        const johnCheckboxes = screen.getAllByRole("checkbox", {
            name: "Select John Doe",
        });

        fireEvent.click(johnCheckboxes[0]);

        const deactivateButton = screen.getByRole("button", {
            name: "Deactivate Selected",
        });

        fireEvent.click(deactivateButton);

        await waitFor(() => {
            expect(
                screen.getByRole("progressbar", {
                    name: "Employee bulk update progress",
                }),
            ).toBeInTheDocument();
        });
    });
});
