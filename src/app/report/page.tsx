import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReportIssueForm } from "@/components/citizen/ReportIssueForm";

export default function ReportPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <ReportIssueForm />
      </main>
      <Footer />
    </div>
  );
}
