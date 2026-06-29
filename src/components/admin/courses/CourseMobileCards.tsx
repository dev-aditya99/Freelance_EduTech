import { motion } from "framer-motion";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCourseStore } from "@/store/course.store";
import Image from "next/image";
import { FaStar } from "react-icons/fa6";

export function CourseMobileCards() {
  const { courses, deleteCourse } = useCourseStore();

  return (
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
              <button
                onClick={() => deleteCourse(course._id)}
                className="p-2 text-slate-500 hover:text-rose-600 bg-slate-50 dark:bg-slate-800 rounded-lg"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
