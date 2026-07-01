"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Users, Plus } from "lucide-react";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { useInstructorStore } from "@/store/instructor.store"; // Update path if needed
import { Loader } from "@/components/ui/Loader";
import { EmptyState } from "@/components/ui/EmptyState";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { InstructorFilters } from "@/components/admin/instructors/InstructorFilters";
import { InstructorCard } from "@/components/admin/instructors/InstructorCard";
import { InstructorModal } from "@/components/admin/instructors/InstructorModal";
import { IInstructor } from "@/types/instructor.types";

export default function InstructorsLibraryPage() {
  const { execute, isLoading } = useAsyncHandler();
  const { instructors, fetchInstructors } = useInstructorStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] =
    useState<IInstructor | null>(null);

  const [filters, setFilters] = useState({ search: "", status: "" });

  // Client-side Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 8; // Items per page

  // Fetch from API via Zustand store
  useEffect(() => {
    execute(
      async () => {
        await fetchInstructors(filters.search); // Backend handles search[cite: 4]
      },
      { loadingKey: "fetch_instructors", showToast: false },
    );
    setCurrentPage(1); // Reset page on search change
  }, [filters.search, fetchInstructors, execute]);

  // Client-side Filtering for Status & Pagination
  const filteredInstructors = useMemo(() => {
    let result = instructors;
    if (filters.status === "ACTIVE") result = result.filter((i) => i.isActive);
    if (filters.status === "INACTIVE")
      result = result.filter((i) => !i.isActive);
    return result;
  }, [instructors, filters.status]);

  const totalPages = Math.ceil(filteredInstructors.length / limit) || 1;
  const paginatedInstructors = filteredInstructors.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const openAddModal = () => {
    setSelectedInstructor(null);
    setIsModalOpen(true);
  };

  const openEditModal = (instructor: IInstructor) => {
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sora text-slate-900 dark:text-white tracking-tight">
            Instructors Hub
          </h1>
          <p className="text-sm text-slate-500 font-inter mt-1 flex items-center gap-2">
            <Users size={14} /> Total {filteredInstructors.length} instructors
            found
          </p>
        </div>
        <DynamicButton
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={openAddModal}
        >
          Add Instructor
        </DynamicButton>
      </div>

      <InstructorFilters currentFilters={filters} onFilterChange={setFilters} />

      {/* Content Area */}
      {isLoading("fetch_instructors") && instructors.length === 0 ? (
        <div className="py-20">
          <Loader fullContainer size="lg" text="Loading instructors..." />
        </div>
      ) : filteredInstructors.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No instructors found"
          description="Add a new instructor to the platform to get started."
          variant="page"
          actionLabel="Add Instructor"
          onAction={openAddModal}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedInstructors.map((instructor) => (
              <InstructorCard
                key={instructor._id.toString()}
                instructor={instructor}
                onEdit={openEditModal}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-sm text-slate-500 font-medium font-inter">
                Showing Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <DynamicButton
                  variant="outline"
                  isFullWidth
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                >
                  Previous
                </DynamicButton>
                <DynamicButton
                  variant="outline"
                  isFullWidth
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                >
                  Next
                </DynamicButton>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <InstructorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        instructorToEdit={selectedInstructor}
      />
    </div>
  );
}
