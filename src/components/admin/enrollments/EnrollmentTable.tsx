import { useEffect } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle,
  Clock,
  Ban,
  RefreshCcw,
  FileText,
} from "lucide-react";
import { useEnrollmentStore } from "@/store/enrollment.store";
import { DynamicDate } from "@/components/ui/DynamicDate";
import { EmptyState } from "@/components/ui/EmptyState";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import Image from "next/image";

export function EnrollmentTable() {
  const {
    enrollments,
    pagination,
    setPage,
    currentPage,
    fetchEnrollments,
    updateStatus,
  } = useEnrollmentStore();
  const { execute, isLoading } = useAsyncHandler();

  useEffect(() => {
    fetchEnrollments();
  }, [currentPage, fetchEnrollments]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    await execute(
      async () => {
        await updateStatus(id, newStatus);
      },
      {
        loadingKey: `status_${id}`,
        showToast: true,
        successMsg: `Enrollment status updated to ${newStatus}!`,
        errorMsg: "Failed to update status.",
      },
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 px-2 py-1 rounded text-[10px] font-bold uppercase">
            Active
          </span>
        );
      case "EXPIRED":
        return (
          <span className="bg-amber-50 text-amber-700 dark:bg-amber-500/10 px-2 py-1 rounded text-[10px] font-bold uppercase">
            Expired
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-rose-50 text-rose-700 dark:bg-rose-500/10 px-2 py-1 rounded text-[10px] font-bold uppercase">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-[10px] font-bold uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="w-full flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-b-2xl shadow-sm">
      <div className="w-full overflow-x-auto custom-scrollbar">
        {enrollments.length > 0 ? (
          <table className="w-full text-sm text-left shrink-0 text-nowrap overflow-x-auto">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Student
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Course
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Enrolled At
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Expires At
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  certificate Issued
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrollments.map((env) => {
                const user = env.user || {};
                const course = env.course || {};

                return (
                  <motion.tr
                    layout
                    key={env._id}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                  >
                    {/* User Column */}
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shrink-0 items-center justify-center font-bold">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt="pic"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          user.fullName?.charAt(0) || "U"
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {user.fullName || "Unknown User"}
                        </span>
                        <span className="text-xs text-slate-500">
                          {user.email || "No email"}
                        </span>
                      </div>
                    </td>

                    {/* Course Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {course.thumbnail && (
                          <Image
                            src={
                              course?.thumbnail || "https://placehold.co/32x32"
                            }
                            className="w-8 h-8 rounded object-cover"
                            alt="course"
                            width={32}
                            height={32}
                            loading="lazy"
                            quality={10}
                            unoptimized={!course.thumbnail}
                            placeholder="blur"
                            blurDataURL="https://placehold.co/32x32"
                          />
                        )}
                        <span
                          className="font-medium text-slate-700 dark:text-slate-300 max-w-[200px] truncate"
                          title={course.title}
                        >
                          {course.title || "Deleted Course"}
                        </span>
                      </div>
                    </td>

                    {/* Progress Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${env.progressPercentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          {Math.round(env.progressPercentage)}%
                        </span>
                      </div>
                    </td>

                    {/* Enrolled  At */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300 text-center">
                      <DynamicDate
                        date={env.enrolledAt}
                        formatType="hybrid"
                        className="text-xs"
                        enableExpand
                      />
                    </td>

                    {/* Expires At */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                      {env.expiresAt ? (
                        <DynamicDate
                          date={env.expiresAt}
                          formatType="hybrid"
                          className="text-xs"
                          enableExpand
                        />
                      ) : (
                        <span className="text-emerald-600 font-medium text-xs">
                          Lifetime Access
                        </span>
                      )}
                    </td>

                    {/* Status  */}
                    <td className="px-6 py-4">{getStatusBadge(env.status)}</td>

                    {/* Certificate Issued  */}
                    <td className="px-6 py-4 text-center">
                      {env.certificateIssued ? "Yes" : "No"}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {env.status === "ACTIVE" ? (
                        <ConfirmDialog
                          title="Revoke Access"
                          description="Are you sure you want to cancel this enrollment? The student will lose access to the course."
                          onConfirm={() =>
                            handleStatusChange(env._id, "CANCELLED")
                          }
                          confirmText="Cancel Access"
                          variant="danger"
                        >
                          <DynamicButton
                            size="sm"
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50"
                            leftIcon={<Ban size={14} />}
                          >
                            Revoke
                          </DynamicButton>
                        </ConfirmDialog>
                      ) : (
                        <ConfirmDialog
                          title="Restore Access"
                          description="Are you sure you want to restore access for this student?"
                          onConfirm={() =>
                            handleStatusChange(env._id, "ACTIVE")
                          }
                          confirmText="Restore Access"
                          variant="success"
                        >
                          <DynamicButton
                            size="sm"
                            variant="outline"
                            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            leftIcon={<RefreshCcw size={14} />}
                          >
                            Restore
                          </DynamicButton>
                        </ConfirmDialog>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={BookOpen}
            title="No enrollments found"
            description="No student has enrolled yet based on the current filters."
            variant="card"
          />
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <DynamicButton
              variant="outline"
              size="sm"
              isFullWidth
              disabled={pagination.page <= 1}
              onClick={() => setPage(pagination.page - 1)}
            >
              Previous
            </DynamicButton>
            <DynamicButton
              variant="outline"
              size="sm"
              isFullWidth
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPage(pagination.page + 1)}
            >
              Next
            </DynamicButton>
          </div>
        </div>
      )}
    </div>
  );
}
