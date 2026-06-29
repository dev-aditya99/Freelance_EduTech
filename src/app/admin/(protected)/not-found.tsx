import React from "react";
import { Metadata } from "next";
import { DynamicNotFound } from "@/components/ui/DynamicNotFound";

export const metadata: Metadata = {
  title: "404 - Page Not Found | EduAdmin",
  description: "The page you are looking for does not exist.",
};

export default function AdminNotFound() {
  return (
    <DynamicNotFound
      variant="page"
      title="Looks like you're lost"
      description="We couldn't find the page you were looking for. It might have been moved, deleted, or perhaps the URL is incorrect."
      actionHref="/admin"
      actionLabel="Back to Dashboard"
    />
  );
}
