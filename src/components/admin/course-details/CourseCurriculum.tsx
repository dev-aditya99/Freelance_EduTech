"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  GripVertical,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  PlayCircle,
  FileText,
  X,
  Trash,
  BookOpenCheck,
} from "lucide-react";
import { DynamicButton } from "@/components/ui/DynamicButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { LessonDrawer } from "./LessonDrawer";
import {
  createSection,
  deleteLesson,
  deleteSection,
  getLessons,
  getSections,
  updateLesson,
  updateSection,
} from "@/services/section.service";
import toast from "react-hot-toast";
import { Loader } from "@/components/ui/Loader";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsyncHandler } from "@/hooks/useAsyncHandler";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Lesson, Section } from "@/types/section.types";

export function CourseCurriculum({ course }: { course: any }) {
  // Hooks
  const { execute, isLoading } = useAsyncHandler();

  // States
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Lesson Drawer States
  const [selectedLesson, setSelectedLesson] = useState<any | null>(null);
  const [isLessonDrawerOpen, setIsLessonDrawerOpen] = useState(false);

  // Section Modal States
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any | null>(null);
  const [sectionTitle, setSectionTitle] = useState("");

  // Sections State (For Drag & Drop)
  const [sections, setSections] = useState<any[]>(course.sections || []);
  const [sectionId, setSectionId] = useState<string>();

  const [loadingSections, setLoadingSections] = useState(false);

  const [lessons, setLessons] = useState<any[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  useEffect(() => {
    if (!isLessonDrawerOpen) {
      fetchSections();
      if (sectionId) {
        fetchLessons(sectionId);
      }
    }
  }, [isLessonDrawerOpen]);

  // Fetch Sections
  const fetchSections = async () => {
    setLoadingSections(true);
    try {
      const data = await getSections(course._id);
      const allSections = data.sections;

      if (allSections) {
        setSections(allSections);
      }
    } catch (error) {
      toast.error("Failed fetch Sections!");
    } finally {
      setLoadingSections(false);
    }
  };

  // Fetch Lessons
  const fetchLessons = async (section_id: any) => {
    setLoadingLessons(true);
    try {
      const data = await getLessons(section_id);
      const allLessons = data.lessons;

      if (allLessons) {
        setLessons(allLessons);
        return allLessons;
      }
    } catch (error) {
      toast.error("Failed fetch Lessons!");
    } finally {
      setLoadingLessons(false);
    }
  };

  // DRAG & DROP LOGIC
  // const handleSectionReorder = async (
  //   sortOrder: number = 0,
  //   sectionId: string,
  // ) => {
  //   if (sortOrder === 0) {
  //     toast.error("Can't be sorted");
  //     return;
  //   }
  //   const data = await updateSection(sectionId, {
  //     sortOrder,
  //   });

  //   setSections(
  //     sections.map((sec) => (sec._id === sectionId ? data.section : sec)),
  //   );

  //   toast.success("Section Sorted");
  // };

  const handleSectionReorder = async (
    newOrder: Section[],
    draggedId: string,
  ) => {
    setSections(newOrder);

    await execute(
      async () => {
        await Promise.all(
          newOrder.map((sec, index) =>
            updateSection(sec._id, { sortOrder: index + 1 }),
          ),
        );
      },
      {
        loadingKey: `sort_order_${draggedId}`,
        showToast: true,
        successMsg: "Section Moved!",
        errorMsg: "Unable to move section!",
        onSuccess: () => {
          setSections(newOrder);
          setIsSectionModalOpen(false);
        },
      },
    );
  };

  const handleLessonReorder = async (
    newLessonsOrder: any[],
    lessonId: string,
  ) => {
    setLessons(newLessonsOrder);

    await execute(
      async () => {
        await Promise.all(
          newLessonsOrder.map((less, index) =>
            updateLesson(less._id, { sortOrder: index + 1 }),
          ),
        );
      },
      {
        loadingKey: `lesson_sort_order_${lessonId}`,
        showToast: true,
        successMsg: "Lesson Moved!",
        errorMsg: "Unable to move lesson!",
        onSuccess: () => {
          setLessons(newLessonsOrder);
        },
      },
    );
  };

  // MODAL HANDLERS
  const openSectionModal = (section: any = null) => {
    setEditingSection(section);
    setSectionTitle(section ? section.title : "");
    setIsSectionModalOpen(true);
  };

  // Save and Edit section
  const handleSaveSection = async () => {
    if (!sectionTitle.trim()) return;

    await execute(
      async () => {
        if (editingSection) {
          const data = await updateSection(editingSection._id, {
            title: sectionTitle,
          });
          setSections(
            sections.map((sec) =>
              sec._id === editingSection._id ? data.section : sec,
            ),
          );
          return data;
        } else {
          const data = await createSection(course._id, { title: sectionTitle });
          if (data) {
            setSections([...sections, data.section]);
          }
          return data;
        }
      },
      {
        loadingKey: "save_section_modal",
        showToast: true,
        successMsg: editingSection
          ? "Section updated successfully!"
          : "Section created successfully!",
        errorMsg: editingSection
          ? "Unable to change section title!"
          : "Unable to create section!",
        onSuccess: () => {
          setIsSectionModalOpen(false);
        },
      },
    );
  };

  // Delete Section
  const handleDeleteSection = async (sectionId: string) => {
    await execute(
      async () => {
        const allLessons = await fetchLessons(sectionId);
        let lessonLength = allLessons.length;
        if (lessonLength > 0) {
          await Promise.all(
            allLessons.map((lesson: Lesson) =>
              deleteLessonHandler(lesson._id, sectionId),
            ),
          );
        }
        await deleteSection(sectionId);
        setSections(sections.filter((sec) => sec._id !== sectionId));
      },
      {
        loadingKey: `delete_section_${sectionId}`,
        showToast: true,
        successMsg: "Section deleted successfully!",
        errorMsg: `Unable to delete ${sectionId || "section"}`,
      },
    );
  };

  // Redirect to Edit Lesson
  const handleLessonEdit = (lesson: any, sectionId: string) => {
    setSectionId(sectionId);
    setSelectedLesson({ ...lesson, sectionId });
    setIsLessonDrawerOpen(true);
  };

  // Delete Lesson
  const deleteLessonHandler = async (id: string, sectionId: string) => {
    await execute(
      async () => {
        await deleteLesson(id);
        await fetchSections();
        await fetchLessons(sectionId);
      },
      {
        loadingKey: `delete_lesson_${id}`,
        showToast: true,
        successMsg: "Lesson deleted successfully!",
        errorMsg: `Unable to delete ${id || "section"}`,
        onError(error) {
          console.log(error);
          toast.error(
            error?.response?.data?.message || "Unable to delete Lesson",
          );
        },
      },
    );
  };

  return (
    <div className="space-y-4 relative">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-[#111] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Curriculum
          </h3>
          <p className="text-xs text-slate-500">
            Drag items to reorder chapters and lessons.
          </p>
        </div>
        <DynamicButton
          variant="primary"
          leftIcon={<Plus size={16} />}
          onClick={() => openSectionModal()}
        >
          Add Section
        </DynamicButton>
      </div>

      {loadingSections ? (
        <>
          <Skeleton
            className="h-12 bg-gray-200 dark:bg-gray-500 border border-slate-200 rounded-2xl overflow-hidden shadow-sm list-none"
            aria-multiline={"true"}
            repeat={4}
            children={
              <div className="flex items-center justify-between gap-3 px-2 pt-3.5">
                <div className="flex items-center gap-3">
                  <Skeleton
                    className="w-8 h-5 bg-gray-300 dark:bg-gray-300 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm list-none"
                    aria-multiline={"true"}
                  />

                  <Skeleton
                    className="w-80 h-5 bg-gray-300 dark:bg-gray-300 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm list-none"
                    aria-multiline={"true"}
                  />

                  <Skeleton
                    className="w-5 h-4 bg-gray-300 dark:bg-gray-300 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm list-none"
                    aria-multiline={"true"}
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Skeleton
                    className="w-5 h-4 bg-gray-300 dark:bg-gray-300 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm list-none"
                    aria-multiline={"true"}
                  />

                  <Skeleton
                    className="w-5 h-4 bg-gray-300 dark:bg-gray-300 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm list-none"
                    aria-multiline={"true"}
                  />

                  <Skeleton
                    className="w-5 h-4 bg-gray-300 dark:bg-gray-300 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm list-none"
                    aria-multiline={"true"}
                  />
                </div>
              </div>
            }
          />
        </>
      ) : sections.length === 0 ? (
        <EmptyState
          variant="card"
          title="Curriculum is empty"
          description="Start building your course by adding the first section."
          actionLabel="Create Section"
          onAction={() => openSectionModal()}
        />
      ) : (
        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={(newOrder) =>
            handleSectionReorder(newOrder, sectionId as string)
          }
          className="space-y-4"
        >
          {sections.map((section) => (
            <Reorder.Item
              key={section._id}
              value={section}
              className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm list-none"
              onDrag={() => setSectionId(section._id)}
            >
              {/* Section Header */}
              <div
                className="flex sm:flex-row flex-col-reverse/ sm:items-center items-start sm:justify-between  p-4 bg-slate-50/50 dark:bg-[#111] cursor-pointer hover:bg-slate-50 dark:hover:bg-[#1A1A1A] transition-colors"
                onClick={() => {
                  setExpandedSection(
                    expandedSection === section._id ? null : section._id,
                  );
                  fetchLessons(section._id);
                }}
              >
                <div className="flex flex-1 flex-wrap items-center gap-3">
                  <GripVertical
                    size={16}
                    className="text-slate-400 cursor-grab hover:text-slate-600 active:cursor-grabbing"
                  />
                  <h4 className="font-bold text-slate-900 dark:text-white text-base select-none">
                    {section.title}
                  </h4>
                  {/* Total Lessons Desktop  */}
                  <span className="hidden sm:inline-flex text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {section?.totalLessons || 0} Lessons
                  </span>

                  {/* Total Lessons Phone  */}
                  <span className="flex items-center gap-1 sm:hidden text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {section?.totalLessons || 0} <BookOpenCheck size={14} />
                  </span>

                  {/* Total Minutes Desktop  */}
                  <span className="hidden sm:flex text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {section?.totalDuration || 0} mins
                  </span>

                  {/* Total Minutes Phone  */}
                  <span className="flex sm:hidden text-xs font-medium text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {section?.totalDuration || 0} m
                  </span>
                </div>
                {/* Action Buttons  */}
                <div className="flex flex-1 items-center justify-end gap-2">
                  <DynamicButton
                    className="bg-transparent border-0"
                    isLoading={isLoading(`sort_order_${section._id}`)}
                    variant="outline"
                  />

                  <button
                    className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md"
                    onClick={(e) => {
                      e.stopPropagation();
                      openSectionModal(section);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  {/* ? */}
                  <ConfirmDialog
                    title="Delete Section"
                    description={`Are you sure you want to delete "${section?.title || "this Section"}"? This has (${section?.totalLessons}) lessons ${section?.totalDuration > 0 ? `and the duration of (${section?.totalDuration})mins` : ""}. This action cannot be undone.`}
                    variant="danger"
                    confirmText="Yes, Delete"
                    onConfirm={async () => {
                      handleDeleteSection(section._id);
                    }}
                  >
                    <Trash2 size={14} />
                  </ConfirmDialog>
                  {/* </button> */}
                  <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-1" />
                  <ChevronDown
                    size={18}
                    className={`text-slate-500 transition-transform ${expandedSection === section._id ? "rotate-180" : ""}`}
                  />
                </div>
              </div>

              {/* Lessons List inside Section */}
              <AnimatePresence>
                {expandedSection === section._id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    className="border-t border-slate-100 dark:border-slate-800/60 overflow-hidden"
                  >
                    <div className="p-4 space-y-2">
                      <Reorder.Group
                        axis="y"
                        values={lessons || []}
                        onReorder={(newLessons) =>
                          handleLessonReorder(newLessons, section._id)
                        }
                        className="space-y-2"
                      >
                        {loadingLessons ? (
                          <Loader />
                        ) : (
                          (lessons || []).map((lesson: any) => (
                            <Reorder.Item
                              key={lesson._id}
                              value={lesson}
                              className="flex items-center justify-between p-3 bg-white dark:bg-[#111] border border-slate-100 dark:border-slate-800 rounded-xl hover:border-blue-200 dark:hover:border-blue-900/50 group transition-all list-none"
                            >
                              <div className="flex items-center gap-3">
                                <GripVertical
                                  size={14}
                                  className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
                                />
                                {lesson.playbackType ? (
                                  <PlayCircle
                                    size={16}
                                    className="text-blue-500"
                                  />
                                ) : (
                                  <FileText
                                    size={16}
                                    className="text-amber-500"
                                  />
                                )}
                                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 select-none">
                                  {lesson.title}
                                </span>
                              </div>

                              {/* Lessons Actionss  */}
                              <div className="flex items-center gap-4">
                                {/* Lesson status  */}
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${lesson.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"}`}
                                >
                                  {lesson.status || "DRAFT"}
                                </span>

                                {/* Lesson Edit btn  */}
                                <DynamicButton
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleLessonEdit(lesson, section._id)
                                  }
                                >
                                  Edit
                                </DynamicButton>

                                {/* Lesson Delete btn  */}
                                <ConfirmDialog
                                  title="Delete Lesson"
                                  description={`Are you sure you want to delete "${lesson?.title || "this Section"}"? This will delete your all the content of the lesson, including thumbnail, video, and resources and cannot be undone.`}
                                  variant="danger"
                                  confirmText="Yes, Delete"
                                  onConfirm={async () => {
                                    deleteLessonHandler(
                                      lesson._id,
                                      section._id,
                                    );
                                  }}
                                  cancelText="No"
                                >
                                  <DynamicButton
                                    variant="ghost"
                                    size="sm"
                                    rightIcon={<Trash size={15} />}
                                    isLoading={isLoading(
                                      `delete_lesson_${lesson._id}`,
                                    )}
                                  />
                                </ConfirmDialog>
                              </div>
                            </Reorder.Item>
                          ))
                        )}
                      </Reorder.Group>

                      <button
                        onClick={() =>
                          handleLessonEdit({ title: "" }, section._id)
                        }
                        className="w-full py-3 mt-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-all"
                      >
                        + Add Lesson
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      {/* Section Create/Edit Modal */}
      <AnimatePresence>
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#111] w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                  {editingSection ? "Edit Section" : "Add New Section"}
                </h3>
                <button
                  onClick={() => setIsSectionModalOpen(false)}
                  className="text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Section Title
                </label>
                <input
                  type="text"
                  value={sectionTitle}
                  onChange={(e) => setSectionTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveSection()}
                  placeholder="e.g. Getting Started"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
                  autoFocus
                />
              </div>
              <div className="p-5 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-[#0A0A0A]">
                <DynamicButton
                  variant="outline"
                  onClick={() => setIsSectionModalOpen(false)}
                >
                  Cancel
                </DynamicButton>
                <DynamicButton
                  variant="primary"
                  onClick={handleSaveSection}
                  isLoading={isLoading("save_section_modal")}
                >
                  {editingSection ? "Update Section" : "Save Section"}
                </DynamicButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Lesson Editor Drawer */}
      {isLessonDrawerOpen && (
        <LessonDrawer
          isOpen={isLessonDrawerOpen}
          onClose={() => setIsLessonDrawerOpen(false)}
          lesson={selectedLesson}
          courseId={course._id}
          sectionId={selectedLesson.sectionId}
        />
      )}
    </div>
  );
}
