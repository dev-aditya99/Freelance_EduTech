import {
  Search,
  ListFilter,
  CircleCheck,
  FileText,
  Archive,
  Table2,
  TableCellsMerge,
} from "lucide-react";
import { useCourseStore } from "@/store/course.store";
import { DynamicSelect, SelectOption } from "@/components/ui/DynamicSelect";
import { ICourseView } from "@/app/admin/(protected)/courses/page";
import { useState } from "react";

export function CourseFilters() {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    setPage,
  } = useCourseStore();

  const [view, setView] = useState<ICourseView>(
    ((typeof window !== "undefined"
      ? localStorage.getItem("course_view")
      : "TABLE") as ICourseView) || "TABLE",
  );

  const handleChangeView = (val: ICourseView) => {
    setView(val);
    localStorage.setItem("course_view", val);
    window.location.reload();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (setPage) setPage(1); // 🟢 Reset to page 1 on search
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    if (setPage) setPage(1); // 🟢 Reset to page 1 on status change
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-5 bg-white dark:bg-[#111] border-x border-t border-slate-200 dark:border-slate-800 rounded-t-2xl">
      <div className="relative w-full md:w-96">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          placeholder="Search courses..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
        />
      </div>

      <div className="flex items-center justify-end w-full md:w-auto gap-3">
        <div className="flex-1 cursor-pointer">
          <DynamicSelect
            value={view}
            onChange={(val) => handleChangeView(val as ICourseView)}
            className="rounded-xl text-sm focus:border-blue-500 dark:text-white appearance-none"
            displayLabel={view}
          >
            <SelectOption value="TABLE" label="Table">
              <div className="flex items-center gap-2">
                <Table2 size={16} className="text-slate-400" />
                <span className="font-bold">Table</span>
              </div>
            </SelectOption>
            <SelectOption value="CARD" label="Card">
              <div className="flex items-center gap-2">
                <TableCellsMerge size={16} className="text-slate-400" />
                <span className="font-bold">Card</span>
              </div>
            </SelectOption>
          </DynamicSelect>
        </div>

        <div className="relative flex-1 lg:w-100 w-50">
          <DynamicSelect
            value={statusFilter}
            onChange={(val) => handleStatusChange(val as string)}
            className="w-full rounded-xl text-sm focus:border-blue-500 dark:text-white appearance-none cursor-pointer"
            displayLabel={statusFilter}
          >
            <SelectOption value="ALL" label="All">
              <div className="flex items-center gap-2">
                <ListFilter size={16} className="text-slate-400" />
                <span className="font-bold">All</span>
              </div>
            </SelectOption>
            <SelectOption value="PUBLISHED" label="Published">
              <div className="flex items-center gap-2">
                <CircleCheck size={16} className="text-slate-400" />
                <span className="font-bold">Published</span>
              </div>
            </SelectOption>
            <SelectOption value="DRAFT" label="Draft">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                <span className="font-bold">Draft</span>
              </div>
            </SelectOption>
            <SelectOption value="ARCHIVED" label="Archived">
              <div className="flex items-center gap-2">
                <Archive size={16} className="text-slate-400" />
                <span className="font-bold">Archived</span>
              </div>
            </SelectOption>
          </DynamicSelect>
        </div>
      </div>
    </div>
  );
}
