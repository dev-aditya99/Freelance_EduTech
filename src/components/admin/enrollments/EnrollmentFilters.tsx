import { Filter, GraduationCap, CheckCircle, Ban, History } from "lucide-react";
import { useEnrollmentStore } from "@/store/enrollment.store";
import { DynamicSelect, SelectOption } from "@/components/ui/DynamicSelect";
import { DynamicSearchSelect } from "@/components/ui/DynamicSearchSelect";
import { getCourses } from "@/services/course.service";

export function EnrollmentFilters() {
  const { statusFilter, setStatusFilter, courseFilter, setCourseFilter } =
    useEnrollmentStore();

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-5 bg-white dark:bg-[#111] border-x border-t border-slate-200 dark:border-slate-800 rounded-t-2xl">
      <div className="relative w-full md:w-96 z-50">
        <DynamicSearchSelect
          value={courseFilter === "ALL" ? "" : courseFilter}
          onChange={(val) => setCourseFilter(val || "ALL")}
          placeholder="Filter by Course..."
          fetchFn={async (query) => {
            try {
              const res = await getCourses({ search: query, limit: 10 });
              return (
                res?.courses?.map((c: any) => ({
                  _id: c._id,
                  name: c.title,
                  image: c.thumbnail,
                })) || []
              );
            } catch (error) {
              return [];
            }
          }}
        />
      </div>

      <div className="flex items-center justify-end w-full md:w-auto gap-3">
        <div className="relative flex-1 lg:w-48 w-full">
          <DynamicSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as string)}
            className="w-full rounded-xl text-sm focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
            displayLabel={statusFilter === "ALL" ? "All Status" : statusFilter}
          >
            <SelectOption value="ALL" label="All Status">
              <span className="font-bold">All Enrollments</span>
            </SelectOption>
            <SelectOption value="ACTIVE" label="Active">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle size={16} />
                <span className="font-bold">Active</span>
              </div>
            </SelectOption>
            <SelectOption value="EXPIRED" label="Expired">
              <div className="flex items-center gap-2 text-amber-600">
                <History size={16} />
                <span className="font-bold">Expired</span>
              </div>
            </SelectOption>
            <SelectOption value="CANCELLED" label="Cancelled">
              <div className="flex items-center gap-2 text-rose-600">
                <Ban size={16} />
                <span className="font-bold">Cancelled</span>
              </div>
            </SelectOption>
          </DynamicSelect>
        </div>
      </div>
    </div>
  );
}
