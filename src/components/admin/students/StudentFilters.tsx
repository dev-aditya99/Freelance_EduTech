import { Search, ShieldAlert, GraduationCap } from "lucide-react";
import { useStudentStore } from "@/store/student.store";
import { DynamicSelect, SelectOption } from "@/components/ui/DynamicSelect";

export function StudentFilters() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    identityFilter,
    setIdentityFilter,
  } = useStudentStore();

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-5 bg-white dark:bg-[#111] border-x border-t border-slate-200 dark:border-slate-800 rounded-t-2xl">
      <div className="relative w-full md:w-96">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
        />
      </div>

      <div className="flex items-center justify-end w-full md:w-auto gap-3">
        {/* Identity Filter */}
        <div className="relative flex-1 lg:w-48 w-full">
          <DynamicSelect
            value={identityFilter}
            onChange={(val) => setIdentityFilter(val as string)}
            className="w-full rounded-xl text-sm focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
            displayLabel={
              identityFilter === "ALL"
                ? "All Identities"
                : identityFilter.replace("_", " ")
            }
          >
            <SelectOption value="ALL" label="All Identities">
              <div className="flex items-center gap-2">
                <GraduationCap size={16} />{" "}
                <span className="font-bold">All</span>
              </div>
            </SelectOption>
            <SelectOption value="SCHOOL_STUDENT" label="School Student">
              <span className="font-bold ml-6">School Student</span>
            </SelectOption>
            <SelectOption value="COLLEGE_STUDENT" label="College Student">
              <span className="font-bold ml-6">College Student</span>
            </SelectOption>
            <SelectOption value="PROFESSIONAL" label="Professional">
              <span className="font-bold ml-6">Professional</span>
            </SelectOption>
            <SelectOption value="OTHER" label="Other">
              <span className="font-bold ml-6">Other</span>
            </SelectOption>
          </DynamicSelect>
        </div>

        {/* Status Filter */}
        <div className="relative flex-1 lg:w-40 w-full">
          <DynamicSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val as string)}
            className="w-full rounded-xl text-sm focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
            displayLabel={
              statusFilter === "ALL"
                ? "All Status"
                : statusFilter === "true"
                  ? "Blocked"
                  : "Active"
            }
          >
            <SelectOption value="ALL" label="All Status">
              <span className="font-bold">All</span>
            </SelectOption>
            <SelectOption value="false" label="Active">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />{" "}
                <span className="font-bold">Active</span>
              </div>
            </SelectOption>
            <SelectOption value="true" label="Blocked">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <ShieldAlert size={16} />{" "}
                <span className="font-bold">Blocked</span>
              </div>
            </SelectOption>
          </DynamicSelect>
        </div>
      </div>
    </div>
  );
}
