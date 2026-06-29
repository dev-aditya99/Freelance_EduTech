"use client";

import React, {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";

// --- Types ---
export interface SelectOptionType {
  value: string | number;
  label: React.ReactNode;
  icon?: React.ReactNode;
  image?: string;
  description?: string;
}

interface SelectContextType {
  selectedValue: string | number | null;
  handleSelect: (
    value: string | number,
    option?: SelectOptionType | any,
  ) => void;
}

const SelectContext = createContext<SelectContextType | null>(null);

interface DynamicSelectProps {
  value: string | number | null;
  onChange: (value: string | number, option?: any) => void;
  options?: SelectOptionType[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  displayLabel?: React.ReactNode; // Useful when using manual children
  children?: React.ReactNode; // For manual option mapping
}

// --- Main Select Wrapper ---
export function DynamicSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  disabled = false,
  className = "",
  displayLabel,
  children,
}: DynamicSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string | number, option?: any) => {
    onChange(val, option);
    setIsOpen(false);
  };

  // Find selected option to display in trigger (if options array is used)
  const selectedOpt = options?.find((o) => o.value === value);

  // Determine what to show on the Trigger Button
  const renderTriggerContent = () => {
    if (displayLabel) return displayLabel; // Custom label via prop
    if (selectedOpt) {
      return (
        <div className="flex items-center gap-2.5 truncate">
          {selectedOpt.image ? (
            <img
              src={selectedOpt.image}
              alt="thumb"
              className="w-5 h-5 rounded-md object-cover shrink-0"
            />
          ) : selectedOpt.icon ? (
            <span className="text-slate-500 shrink-0">{selectedOpt.icon}</span>
          ) : null}
          <span className="truncate text-slate-900 dark:text-white font-medium">
            {selectedOpt.label}
          </span>
        </div>
      );
    }
    if (value)
      return (
        <span className="truncate text-slate-900 dark:text-white font-medium">
          {value}
        </span>
      );

    return <span className="text-slate-400 truncate">{placeholder}</span>;
  };

  return (
    <SelectContext.Provider value={{ selectedValue: value, handleSelect }}>
      <div ref={wrapperRef} className={`relative w-full ${className}`}>
        {/* Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-[#0A0A0A] border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
            disabled
              ? "opacity-60 cursor-not-allowed border-slate-200 dark:border-slate-800"
              : isOpen
                ? "border-blue-500 ring-2 ring-blue-500/20"
                : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#111]"
          }`}
        >
          <div className="flex-1 truncate text-left">
            {renderTriggerContent()}
          </div>
          <ChevronDown
            size={18}
            className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-blue-500" : ""}`}
          />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute left-0 mt-2 w-full bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
            >
              <div className="p-1.5 flex flex-col">
                {options
                  ? options.map((opt) => (
                      <SelectOption
                        key={opt.value}
                        value={opt.value}
                        label={opt.label}
                        icon={opt.icon}
                        image={opt.image}
                        description={opt.description}
                      />
                    ))
                  : children}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SelectContext.Provider>
  );
}

// --- Individual Option Item ---
interface SelectOptionProps extends SelectOptionType {
  children?: React.ReactNode;
  className?: string;
}

export function SelectOption({
  value,
  label,
  icon,
  image,
  description,
  children,
  className = "",
}: SelectOptionProps) {
  const context = useContext(SelectContext);
  if (!context)
    throw new Error("SelectOption must be used within DynamicSelect");

  const isSelected = context.selectedValue === value;

  return (
    <div
      onClick={() =>
        context.handleSelect(value, { value, label, icon, image, description })
      }
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400"
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300"
      } ${className}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        {/* Render Image or Icon */}
        {image ? (
          <img
            src={image}
            alt="option-img"
            className="w-6 h-6 rounded object-cover shrink-0"
          />
        ) : icon ? (
          <span
            className={`shrink-0 ${isSelected ? "text-blue-600 dark:text-blue-400" : "text-slate-400"}`}
          >
            {icon}
          </span>
        ) : null}

        {/* Custom Children OR Default Label/Description */}
        {children ? (
          <div className="flex-1 truncate">{children}</div>
        ) : (
          <div className="flex flex-col truncate">
            <span
              className={`text-sm font-medium truncate ${isSelected ? "text-blue-700 dark:text-blue-400" : ""}`}
            >
              {label}
            </span>
            {description && (
              <span
                className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-blue-600/70 dark:text-blue-400/70" : "text-slate-400"}`}
              >
                {description}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Checkmark for selected item */}
      {isSelected && (
        <Check
          size={16}
          className="text-blue-600 dark:text-blue-400 shrink-0 ml-3"
        />
      )}
    </div>
  );
}
