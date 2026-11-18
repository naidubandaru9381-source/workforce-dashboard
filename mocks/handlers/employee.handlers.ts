import { http, HttpResponse, delay } from "msw";
import { generateEmployees } from "@/mocks/data/seed";

const employees = generateEmployees(5000);

export const employeeHandlers = [
  http.get("/employees", async ({ request }) => {
    await delay(200 + Math.floor(Math.random() * 601));

    const url = new URL(request.url);

    const page = Math.max(
      Number(url.searchParams.get("page")) || 1,
      1,
    );

    const pageSize = Math.min(
      Math.max(
        Number(url.searchParams.get("pageSize")) || 10,
        1,
      ),
      100,
    );

    const search = (
      url.searchParams.get("search") || ""
    ).trim().toLowerCase();

    const department =
      url.searchParams.get("department") || "";

    const status =
      url.searchParams.get("status") || "";

    const joinDateFrom =
      url.searchParams.get("joinDateFrom") || "";

    const joinDateTo =
      url.searchParams.get("joinDateTo") || "";

    const sortBy =
      url.searchParams.get("sortBy") || "firstName";

    const sortOrder =
      url.searchParams.get("sortOrder") === "desc"
        ? "desc"
        : "asc";

    let filteredEmployees = [...employees];

    // Search
    if (search) {
      filteredEmployees = filteredEmployees.filter(
        (employee) =>
          employee.firstName.toLowerCase().includes(search) ||
          employee.lastName.toLowerCase().includes(search) ||
          employee.email.toLowerCase().includes(search) ||
          employee.employeeId.toLowerCase().includes(search),
      );
    }

    // Department filter
    if (department) {
      filteredEmployees = filteredEmployees.filter(
        (employee) =>
          employee.department === department,
      );
    }

    // Status filter
    if (status) {
      filteredEmployees = filteredEmployees.filter(
        (employee) =>
          employee.status === status,
      );
    }

    // Join date range
    if (joinDateFrom) {
      filteredEmployees = filteredEmployees.filter(
        (employee) =>
          employee.joinDate >= joinDateFrom,
      );
    }

    if (joinDateTo) {
      filteredEmployees = filteredEmployees.filter(
        (employee) =>
          employee.joinDate <= joinDateTo,
      );
    }

    // Sorting
    filteredEmployees.sort((a, b) => {
      const first = String(
        a[sortBy as keyof typeof a] ?? "",
      ).toLowerCase();

      const second = String(
        b[sortBy as keyof typeof b] ?? "",
      ).toLowerCase();

      const comparison = first.localeCompare(second, undefined, {
        numeric: true,
      });

      return sortOrder === "desc"
        ? -comparison
        : comparison;
    });

    const total = filteredEmployees.length;

    const totalPages = Math.max(
      Math.ceil(total / pageSize),
      1,
    );

    const safePage = Math.min(page, totalPages);

    const startIndex = (safePage - 1) * pageSize;

    const data = filteredEmployees.slice(
      startIndex,
      startIndex + pageSize,
    );

    return HttpResponse.json({
      data,
      page: safePage,
      pageSize,
      total,
      totalPages,
    });
  }),
];