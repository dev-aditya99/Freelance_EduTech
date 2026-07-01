import { motion } from "framer-motion";
import {
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Globe,
  Tags,
  Star,
  Users,
  FolderOpen,
} from "lucide-react";
import Link from "next/link";
import { useCourseStore } from "@/store/course.store";
import { FaStar } from "react-icons/fa6";
import { DynamicDate } from "@/components/ui/DynamicDate";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useRouter } from "next/navigation";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { useUploader } from "@/hooks/useResourceUpload";
import { CourseStatus } from "@/types/course.types";
import toast from "react-hot-toast";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function CourseTable() {
  const router = useRouter();
  // Extract pagination and setPage from store
  const { courses, deleteCourse, pagination, setPage } = useCourseStore();

  const { execute, isLoading } = useAsyncHandler();

  const handleEditRedirect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    const holdCourse = courses.find((item) => {
      return item._id == id;
    });
    localStorage.setItem("current_course", JSON.stringify(holdCourse));

    router.push(`/admin/courses/${id}/edit`);
  };

  const handleCourseDetailRedirect = (id: string) => {
    const holdCourse = courses.find((item) => {
      return item._id == id;
    });
    localStorage.setItem("current_course", JSON.stringify(holdCourse));
    router.push(`/admin/courses/${id}`);
  };

  const deleteCourseHandler = async (id: string) => {
    let action = CourseStatus.ARCHIVED;
    await execute(
      async () => {
        await deleteCourse(id, action);
      },
      {
        loadingKey: "delete_course",
        showToast: true,
        successMsg: "Course action completed successfully!",
        errorMsg: (err) =>
          err?.response?.data?.message || "Failed to process course.",
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
    <div className="w-full flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-b-2xl shadow-sm">
      <div className="w-full overflow-x-auto custom-scrollbar">
        {courses.length > 0 ? (
          <table className="w-full text-sm text-left shrink-0 text-nowrap overflow-x-auto">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Course Name
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Price
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Discount Price
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Sections
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Lessons
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Language
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Level
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Created By
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Average Ratings
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {courses.map((course) => (
                <motion.tr
                  onClick={() => handleCourseDetailRedirect(course._id)}
                  layout
                  key={course._id}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 flex items-center gap-4 mr-4">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title || "Course"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        quality={10}
                        preload={true}
                      />
                    ) : (
                      <img
                        src={"https://placehold.co/48x48"}
                        alt={course.title || "Course"}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {course.title}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex flex-col">
                        <span>Last updated:</span>
                        <DynamicDate
                          date={course.updatedAt}
                          formatType="hybrid-reverse"
                          className="text-xs"
                          enableExpand
                        />
                      </p>
                      <p className="text-xs text-primary mt-0.5 flex items-center justify-start gap-1">
                        <Tags size={10} /> {course?.category?.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <p className="flex items-center justify-center">
                      ₹{course?.price?.toFixed(2) || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                    <p className="flex items-center justify-center">
                      ₹{course?.discountPrice?.toFixed(2) || 0}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium">
                      {course?.totalSections || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium">
                      {course?.totalLessons || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center justify-center gap-1">
                      {course?.enrollmentCount?.toLocaleString() || 0}{" "}
                      <Users size={14} />
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {course.totalDuration?.toFixed(2) || 0} min
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center justify-center">
                      {course.course_language || course.language}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center justify-center">
                      {course.level}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center justify-center">
                      {course?.createdBy?.fullName || "-"}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <p className="flex items-center justify-center gap-1">
                      <FaStar size={12} className="text-amber-400" />{" "}
                      {course.averageRating || 0}({course.totalRatings || 0})
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${course.status === "PUBLISHED" ? "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400"}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${course.status === "PUBLISHED" ? "bg-blue-600 dark:bg-blue-400" : "bg-slate-500"}`}
                      ></span>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => handleEditRedirect(e, course._id)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                      <ConfirmDialog
                        title="Course Action"
                        description={
                          course.enrollmentCount > 0
                            ? `This course has enrollments. Archive it to remove it from public view safely.`
                            : `Permanently delete this course? All sections, lessons, and media will be wiped.`
                        }
                        onConfirm={() => deleteCourseHandler(course._id)}
                        confirmText={
                          course.enrollmentCount > 0
                            ? "Archive Course"
                            : "Delete Course"
                        }
                        variant={
                          course.enrollmentCount > 0 ? "warning" : "danger"
                        }
                      >
                        <button
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </ConfirmDialog>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={FolderOpen}
            title="No courses found"
            description="Adjust your filters or create a new course to get started."
            variant="card"
          />
        )}
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800">
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
