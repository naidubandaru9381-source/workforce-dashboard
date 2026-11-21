import { render, screen } from "@testing-library/react";

import EditEmployeePanel from "@/components/employees/EditEmployeePanel";

describe("EditEmployeePanel server error mapping", () => {
    const employee = {
        id: "employee-001",
        employeeId: "EMP001",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        phone: "9876543210",
        department: "Engineering",
        designation: "Frontend Developer",
        status: "active" as const,
        joinDate: "2026-01-15",
        salary: 50000,
        managerId: null,
        avatar: "",
    };

    it("maps server validation errors to the corresponding form field", async () => {
        render(
            <EditEmployeePanel
                employee={employee}
                isOpen={true}
                onClose={jest.fn()}
                onSave={jest.fn()}
                isSaving={false}
                serverErrors={{
                    email: "Email already exists",
                }}
            />,
        );

        expect(
            await screen.findByText("Email already exists"),
        ).toBeInTheDocument();
    });
});
