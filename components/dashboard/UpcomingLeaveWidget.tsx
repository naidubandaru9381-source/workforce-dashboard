import type { DashboardSummary } from "@/types/dashboard";

interface UpcomingLeaveWidgetProps {
  data: DashboardSummary["upcomingLeave"];
}

export default function UpcomingLeaveWidget({
  data,
}: UpcomingLeaveWidgetProps) {
  return (
    <section
      className="rounded-xl border bg-white p-5 shadow-sm"
      aria-labelledby="upcoming-leave-heading"
    >
      <h2
        id="upcoming-leave-heading"
        className="text-lg font-semibold"
      >
        Upcoming leave
      </h2>

      {data.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">
          No upcoming leave.
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {data.map((leave) => (
            <article
              key={leave.id}
              className="rounded-lg border p-3"
            >
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {leave.employeeName}
                  </p>

                  <p className="text-sm text-gray-500">
                    {leave.startDate} → {leave.endDate}
                  </p>
                </div>

                <span className="text-sm font-medium">
                  {leave.days} day
                  {leave.days !== 1 ? "s" : ""}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}