"use client";

import { CourseForm } from "@/components/admin/courses/CourseForm";
import { Loader } from "@/components/ui/Loader";
import { useCourseStore } from "@/store/course.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { courses } = useCourseStore();
  const [currentCourse, setCurrentCourse] = useState<any>();

  const filterCurrentCourse = async () => {
    let holdCourse = JSON.parse(localStorage.getItem("current_course"));

    if (!holdCourse) {
      toast.error("Course not found to edit!");
      router.back();

      return;
    }

    setCurrentCourse(holdCourse);
  };

  useEffect(() => {
    filterCurrentCourse();
  }, [courses]);

  return currentCourse ? (
    <CourseForm isEditing={true} initialData={currentCourse} />
  ) : (
    <Loader></Loader>
  );
}
