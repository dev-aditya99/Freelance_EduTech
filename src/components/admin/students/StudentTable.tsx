import { motion } from "framer-motion";
import {
  Users,
  Mail,
  Phone,
  Ban,
  CheckCircle,
  ShieldAlert,
} from "lucide-react";
import { useStudentStore } from "@/store/student.store";
import { DynamicDate } from "@/components/ui/DynamicDate";
import { EmptyState } from "@/components/ui/EmptyState";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import toast from "react-hot-toast";
import Image from "next/image";

export function StudentTable() {
  const { students, pagination, setPage, toggleBlockStatus } =
    useStudentStore();
  const { execute, isLoading } = useAsyncHandler();

  //   Toggle Block Button
  const handleToggleBlock = async (id: string, currentStatus: boolean) => {
    await execute(
      async () => {
        await toggleBlockStatus(id, !currentStatus);
      },
      {
        loadingKey: `block_${id}`,
        showToast: true,
        successMsg: `User successfully ${!currentStatus ? "blocked" : "unblocked"}!`,
        errorMsg: "Action failed. Please try again.",
      },
    );
  };

  return (
    <div className="w-full flex flex-col bg-white dark:bg-[#111] border border-slate-200 dark:border-slate-800 rounded-b-2xl shadow-sm">
      <div className="w-full overflow-x-auto custom-scrollbar">
        {students.length > 0 ? (
          <table className="w-full text-sm text-left shrink-0 text-nowrap overflow-x-auto">
            <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Student Details
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Identity
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Joined On
                </th>
                <th className="px-6 py-4 font-semibold tracking-wider">
                  Onboarding
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
              {students.map((student) => (
                <motion.tr
                  layout
                  key={student._id}
                  className={`hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors hover:blur-none ${student.isBlocked ? "sm:blur-sm sm:bg-red-100/50 sm:text-gray-300/50 " : "blur-none opacity-100"}`}
                >
                  {/* Student names and image  */}
                  <td className="px-6 py-4 flex items-center gap-3">
                    {/* Student Image  */}
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                      {student.profileImage ? (
                        <Image
                          src={
                            student.profileImage || "https://placehold.co/40x40"
                          }
                          alt="profile"
                          width={40}
                          height={40}
                          unoptimized={!student.profileImage}
                          className="w-full h-full rounded-full object-cover"
                          loading="lazy"
                          quality={10}
                          placeholder="blur"
                          blurDataURL="https://placehold.co/40x40"
                        />
                      ) : (
                        student.fullName?.charAt(0).toUpperCase() || "U"
                      )}
                    </div>
                    {/* Name and username  */}
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {student.fullName || "N/A"}
                        {student.onboardingCompleted && (
                          <CheckCircle
                            size={12}
                            className="text-blue-500"
                            aria-label="Onboarding Completed"
                          />
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        @{student.username || "no_username"}
                      </p>
                    </div>
                  </td>

                  {/* Contact details  */}
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail size={12} className="text-slate-400" />{" "}
                      {student.email || "No Email"}
                      {student.isEmailVerified && (
                        <CheckCircle size={10} className="text-emerald-500" />
                      )}
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />{" "}
                      {student.mobile || "No Mobile"}
                      {student.isMobileVerified && (
                        <CheckCircle size={10} className="text-emerald-500" />
                      )}
                    </p>
                  </td>

                  {/* Identity  */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <span className="bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs font-medium">
                      {student.identity
                        ? student.identity.replace("_", " ")
                        : "Not Set"}
                    </span>
                  </td>

                  {/* Joined on  */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    <DynamicDate
                      date={student.createdAt}
                      formatType="hybrid"
                      className="text-xs"
                      enableExpand
                    />
                  </td>
                  {/* Student Onboarding  */}
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                    {student.onboardingCompleted ? (
                      <span>Completed</span>
                    ) : (
                      <span>Pending</span>
                    )}
                  </td>

                  {/* Student Status  */}
                  <td className="px-6 py-4">
                    {student.isBlocked ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-rose-600 dark:bg-rose-400"></span>
                        Blocked
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-600 dark:bg-emerald-400"></span>
                        Active
                      </span>
                    )}
                  </td>

                  {/* Block  */}
                  <td className="px-6 py-4 text-right text-wrap">
                    <ConfirmDialog
                      title={student.isBlocked ? "Unblock User" : "Block User"}
                      description={
                        student.isBlocked
                          ? `Are you sure you want to unblock ${student?.fullName ?? "this user"}? They will regain access to their account.`
                          : `Are you sure you want to block ${student.fullName}? They will lose access to the platform.`
                      }
                      onConfirm={() =>
                        handleToggleBlock(student._id, student.isBlocked)
                      }
                      confirmText={student.isBlocked ? "Unblock" : "Block User"}
                      variant={student.isBlocked ? "success" : "danger"}
                      className="text-left opacity-100!"
                    >
                      <DynamicButton
                        isLoading={isLoading(`block_${student._id}`)}
                        variant="outline"
                        size="sm"
                        className={`border ${student.isBlocked ? "text-emerald-600 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-900/30" : "text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900/30"}`}
                        leftIcon={
                          student.isBlocked ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Ban size={14} />
                          )
                        }
                      >
                        {student.isBlocked ? "Unblock" : "Block"}
                      </DynamicButton>
                    </ConfirmDialog>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Adjust your filters or wait for new students to register."
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
              ({pagination.total} total students)
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
