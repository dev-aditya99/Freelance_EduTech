// src/components/ui/DynamicSearchSelect.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DynamicSearchSelectProps {
  value: string;
  onChange: (value: string, item?: any) => void;
  fetchFn: (query: string) => Promise<any[]>;
  placeholder?: string;
  defaultItem?: any;
  initialItem?: any;
}

export function DynamicSearchSelect({
  value,
  onChange,
  fetchFn,
  placeholder = "Search...",
  defaultItem = null,
  initialItem = null,
}: DynamicSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(
    defaultItem || initialItem,
  );
  const wrapperRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await fetchFn(query);
        setResults(data || []);
      } catch (error) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query, isOpen, fetchFn]);

  if (value && selectedItem) {
    return (
      <div className="flex items-center justify-between w-full px-4 py-2.5 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl transition-all">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
            {selectedItem.thumbnail || selectedItem.image ? (
              <img
                src={selectedItem.thumbnail || selectedItem.image}
                alt="thumb"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImageIcon size={14} className="text-slate-400" />
            )}
          </div>
          <div className="flex flex-col truncate">
            <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
              {selectedItem.name || selectedItem.title}
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              /{selectedItem.slug}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange("");
            setSelectedItem(null);
            setQuery("");
          }}
          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 dark:text-white transition-all"
        />
        {isLoading && (
          <Loader2
            size={16}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 animate-spin"
          />
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-full bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar"
          >
            {!isLoading && results.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                No results found
              </div>
            ) : (
              <div className="p-1.5 flex flex-col gap-1">
                {results.map((item, idx) => (
                  <div
                    key={item._id || item.id || idx}
                    onClick={() => {
                      onChange(item._id || item.id, item);
                      setSelectedItem(item);
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex shrink-0 items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700">
                      {item.thumbnail || item.image ? (
                        <img
                          src={item.thumbnail || item.image}
                          alt="thumb"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={16} className="text-slate-400" />
                      )}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {item.name || item.title}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        /{item.slug}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
