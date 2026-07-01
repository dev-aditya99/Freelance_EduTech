import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCourseStore } from "@/store/course.store";
import Image from "next/image";
import { FaStar } from "react-icons/fa6";
import { CourseStatus } from "@/types/course.types";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DynamicButton } from "@/components/ui/DynamicButton";

export function CourseMobileCards() {
  const { courses, deleteCourse, pagination, setPage } = useCourseStore();

  // Custom hooks
  const { execute, isLoading } = useAsyncHandler();

  const deleteCourseHandler = async (id: string) => {
    let action = CourseStatus.ARCHIVED;
    await execute(
      async () => {
        await deleteCourse(id, action);
      },
      {
        loadingKey: "delete_course",
        showToast: true,
        successMsg: "Thumbnail Deleted successfully!",
        errorMsg: (err) =>
          err.response.data.message || "Failed to delete video.",
        onSuccess(data) {
          window.location.reload();
        },
        onError: (error) => {
          console.log(error);
        },
      },
    );
  };

  return (
    <div className="flex-1">
      <div className="flex sm:flex-row flex-col flex-wrap gap-4 p-4">
        {courses.map((course) => (
          <motion.div
            layout
            key={course._id}
            className="sm:min-w-[300px] bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col gap-4 shrink-0 flex-1"
          >
            <div className="flex gap-4">
              {course.thumbnail ? (
                <Image
                  src={course.thumbnail}
                  alt={course.title || "Course"}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  quality={10}
                  preload={true}
                  placeholder="blur"
                  blurDataURL="https://placehold.co/80x80"
                />
              ) : (
                <img
                  src={"https://placehold.co/80x80"}
                  alt={course.title || "Course"}
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                />
              )}

              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-sm font-normal text-slate-600 dark:text-white line-clamp-2">
                  {course.slug}
                </p>
                <div className="flex items-center justify-between mt-2">
                  {/* Prices  */}
                  <div className="flex flex-col">
                    {/* Price  */}
                    <span className="text-xs font-medium text-gray-500 dark:text-white line-through">
                      ₹{course.price}
                    </span>

                    {/* Discount Price  */}
                    <span className="text-sm font-bold text-gray-800 dark:text-white">
                      ₹{course.discountPrice}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${course.status === "PUBLISHED" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"}`}
                  >
                    {course.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {course.enrollmentCount} Students
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                  <FaStar className="text-amber-400" />
                  {course.averageRating}({course.totalRatings})
                </p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/courses/${course._id}/edit`}
                  className="p-2 text-slate-500 hover:text-blue-600 bg-slate-50 dark:bg-slate-800 rounded-lg"
                >
                  <Edit size={16} />
                </Link>

                <ConfirmDialog
                  title="Delete Course"
                  description={
                    course.enrollmentCount > 0
                      ? `This course has "${course.enrollmentCount}" enrollments, so it can't be delete. Archive it and get it back at any time.`
                      : `Are sure you want to delete this course? It has "${course.totalSections}" Sections, "${course.totalLessons}" Lessons, and "${course.totalRatings}" Ratings with Duration of ${course.totalDuration}mins, and this action will permanently delete the course with all the sections and lessons and their media content.`
                  }
                  onConfirm={() => deleteCourseHandler(course._id)}
                  confirmText={
                    course.enrollmentCount > 0 ? "Archive it" : "I'm sure"
                  }
                  cancelText="Cancel"
                  className="text-wrap! text-left"
                >
                  <DynamicButton
                    isLoading={isLoading("delete_course")}
                    variant="ghost"
                    className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                    rightIcon={<Trash2 size={18} />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </ConfirmDialog>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-1 flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 font-medium">
            Showing Page {pagination.page} of {pagination.totalPages}{" "}
            <span className="hidden sm:inline">
              ({pagination.total} total courses)
            </span>
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DynamicButton
              variant="outline"
              size="sm"
              isFullWidth
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
              className="sm:w-auto"
            >
              Previous
            </DynamicButton>
            <DynamicButton
              variant="outline"
              size="sm"
              isFullWidth
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
              className="sm:w-auto"
            >
              Next
            </DynamicButton>
          </div>
        </div>
      )}
    </div>
  );
}
