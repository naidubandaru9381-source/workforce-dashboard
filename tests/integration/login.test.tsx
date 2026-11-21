import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import LoginPage from "@/app/(auth)/login/page";

const mockReplace = jest.fn();
const mockGet = jest.fn();

const mockDispatch = jest.fn();

const mockLogin = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        replace: mockReplace,
    }),

    useSearchParams: () => ({
        get: mockGet,
    }),
}));

jest.mock("react-redux", () => ({
    useDispatch: () => mockDispatch,
}));

jest.mock("@/features/auth/authApi", () => ({
    useLoginMutation: () => [
        mockLogin,
        {
            isLoading: false,
        },
    ],
}));

jest.mock("@/lib/auth/authStorage", () => ({
    saveAuthSession: jest.fn(),
}));

jest.mock("@/features/auth/authSlice", () => ({
    setCredentials: jest.fn((data) => ({
        type: "auth/setCredentials",
        payload: data,
    })),
}));

describe("LoginPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        mockGet.mockReturnValue(null);

        mockLogin.mockReset();

        mockLogin.mockReturnValue({
            unwrap: jest.fn().mockResolvedValue({
                user: {
                    id: "user-1",
                    email: "admin@example.com",
                    name: "Admin User",
                    role: "admin",
                },
                accessToken: "access-token",
                refreshToken: "refresh-token",
                expiresAt: Date.now() + 60_000,
            }),
        });
    });

    it("renders the login form", () => {
        render(<LoginPage />);

        expect(
            screen.getByRole("heading", {
                name: "Workforce Dashboard",
            }),
        ).toBeInTheDocument();

        expect(screen.getByLabelText("Email")).toBeInTheDocument();

        expect(screen.getByLabelText("Password")).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: "Sign In",
            }),
        ).toBeInTheDocument();
    });

    it("shows validation errors when the form is submitted empty", async () => {
        render(<LoginPage />);

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sign In",
            }),
        );

        expect(await screen.findByText(/email/i)).toBeInTheDocument();

        expect(screen.getByText(/password/i)).toBeInTheDocument();

        expect(mockLogin).not.toHaveBeenCalled();
    });

    it("submits valid credentials", async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), {
            target: {
                value: "admin@example.com",
            },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "Admin@123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sign In",
            }),
        );

        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: "admin@example.com",
                password: "Admin@123",
            });
        });
    });

    it("redirects to dashboard after successful login", async () => {
        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), {
            target: {
                value: "admin@example.com",
            },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "Admin@123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sign In",
            }),
        );

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/dashboard");
        });
    });

    it("preserves the requested redirect destination", async () => {
        mockGet.mockImplementation((key: string) => {
            if (key === "redirect") {
                return "/employees";
            }

            return null;
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), {
            target: {
                value: "admin@example.com",
            },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "Admin@123",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sign In",
            }),
        );

        await waitFor(() => {
            expect(mockReplace).toHaveBeenCalledWith("/employees");
        });
    });

    it("shows the server error when login fails", async () => {
        mockLogin.mockReturnValue({
            unwrap: jest.fn().mockRejectedValue({
                data: {
                    message: "Invalid email or password",
                },
            }),
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText("Email"), {
            target: {
                value: "admin@example.com",
            },
        });

        fireEvent.change(screen.getByLabelText("Password"), {
            target: {
                value: "WrongPassword",
            },
        });

        fireEvent.click(
            screen.getByRole("button", {
                name: "Sign In",
            }),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Invalid email or password",
        );

        expect(mockReplace).not.toHaveBeenCalled();
    });
});
