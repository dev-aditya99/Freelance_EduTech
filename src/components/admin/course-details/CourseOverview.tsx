import React from "react";
import { CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

export function CourseOverview({ course }: { course: any }) {
  if (
    course.whatYouWillLearn?.length === 0 &&
    course.requirements?.length === 0 &&
    course.targetAudience?.length === 0
  ) {
    return (
      <EmptyState
        title="Not Overview found"
        variant="card"
        routePath={`/admin/courses/${course._id}/edit`}
        routeLabel="Create Now"
      />
    );
  }
  return (
    <div className="space-y-6">
      {/* What You'll Learn */}
      {course.whatYouWillLearn?.length > 0 && (
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
            What you'll learn
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {course.whatYouWillLearn.map((item: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
                <p className="text-sm text-slate-700 dark:text-slate-300">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Requirements */}
      {course.requirements?.length > 0 && (
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Requirements
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {course.requirements.map((item: string, idx: number) => (
              <li
                key={idx}
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Target Audience */}
      {course.targetAudience?.length > 0 && (
        <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Target Audience
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            {course.targetAudience.map((item: string, idx: number) => (
              <li
                key={idx}
                className="text-sm text-slate-600 dark:text-slate-400"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
