import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Image as ImageIcon, AlertCircle } from "lucide-react";
import { useCategoryStore } from "@/store/category.store";
import { useMemo } from "react";
import { uploadImage } from "@/services/upload.service";
import { Loader } from "@/components/ui/Loader";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryToEdit?: any | null;
}

export function CategoryFormModal({
  isOpen,
  onClose,
  categoryToEdit,
}: FormModalProps) {
  const isEditing = !!categoryToEdit;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Image State
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string>("");
  const { addCategory, editCategory, categories } = useCategoryStore();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [parentCategory, setParentCategory] = useState("");

  // Reset modal state when opened/closed
  useEffect(() => {
    if (!isOpen) return;
    setImagePreview(categoryToEdit?.image || null);
    setImageFile(null);
    setImageError("");
    setName(categoryToEdit?.name || "");
    setDescription(categoryToEdit?.description || "");
    setSortOrder(categoryToEdit?.sortOrder || 0);
    setParentCategory(categoryToEdit?.parentCategory?._id || "");
  }, [isOpen, categoryToEdit]);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation: Max 2MB Size
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image size must be less than 2MB.");
      return;
    }

    setImageError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      let imageUrl = categoryToEdit?.image || "";

      if (imageFile) {
        const uploaded = await uploadImage(imageFile, "categories");
        imageUrl = uploaded.imageUrl;
      }

      const payload = {
        name,
        description,
        image: imageUrl,
        parentCategory: parentCategory || null,
        sortOrder,
      };

      if (isEditing) {
        await editCategory(categoryToEdit._id, payload);
      } else {
        await addCategory(payload);
      }

      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm sm:p-4">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="bg-white dark:bg-[#111] w-full max-w-md h-full sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
              <form
                id="categoryForm"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {/* Image Uploader */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Category Thumbnail
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group ${
                      imageError
                        ? "border-rose-300 bg-rose-50 dark:border-rose-900/50 dark:bg-rose-500/5"
                        : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:border-blue-400 dark:border-slate-800 dark:bg-[#0A0A0A] dark:hover:border-blue-500/50"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/jpeg, image/png, image/webp"
                      className="hidden"
                    />

                    {imagePreview ? (
                      <>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white/90 text-slate-900 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm">
                            Replace Image
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-center p-4">
                        <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 shadow-sm text-blue-600 dark:text-blue-400">
                          <UploadCloud size={24} />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Click to upload image
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          PNG, JPG or WEBP (Max 2MB)
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
                          Recommended: 800x400px
                        </p>
                      </div>
                    )}
                  </div>
                  {imageError && (
                    <p className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-2 font-medium">
                      <AlertCircle size={14} /> {imageError}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all"
                    placeholder="e.g. Data Science"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-white transition-all resize-none"
                    placeholder="Brief description..."
                  />
                </div>

                {/* Parent Category  */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Parent Category
                  </label>

                  <select
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  >
                    <option value="">No Parent Category</option>

                    {categories
                      .filter((cat) => cat._id !== categoryToEdit?._id)
                      .map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Sort Order  */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Sort Order
                  </label>

                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm dark:text-white"
                  />
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 bg-slate-50/50 dark:bg-[#111]">
              <button
                onClick={onClose}
                type="button"
                className="px-5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                form="categoryForm"
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20"
              >
                {loading ? (
                  <p className="flex items-center justify-center gap-1">
                    Saving...
                    <Loader variant="dots" size="sm" color="white" />
                  </p>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  "Create Category"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
