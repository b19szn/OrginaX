"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  PlusCircle,
  Users,
  FileText,
  Lock,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  RefreshCw,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function InstructorClassroom() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Class creation modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [newClassCode, setNewClassCode] = useState("");
  const [newClassName, setNewClassName] = useState("");
  const [newClassDept, setNewClassDept] = useState("Computer Science");
  const [newClassTerm, setNewClassTerm] = useState("Fall 2026");
  const [isCreatingClass, setIsCreatingClass] = useState(false);

  // Assignment creation modal
  const [isAsgModalOpen, setIsAsgModalOpen] = useState(false);
  const [targetClassId, setTargetClassId] = useState("");
  const [asgTitle, setAsgTitle] = useState("");
  const [asgDesc, setAsgDesc] = useState("");
  const [asgDueDate, setAsgDueDate] = useState("");
  const [asgAllowReport, setAsgAllowReport] = useState(false); // Default restricted by policy
  const [isCreatingAsg, setIsCreatingAsg] = useState(false);

  // Grade modal
  const [gradingSub, setGradingSub] = useState<any | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(90);
  const [feedbackInput, setFeedbackInput] = useState("");
  const [allowReportForThisSub, setAllowReportForThisSub] = useState(false);
  const [isSubmittingGrade, setIsSubmittingGrade] = useState(false);

  const fetchInstructorData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/classroom?view=instructor");
      const data = await res.json();
      if (data.success) {
        setClasses(data.classes || []);
        setAssignments(data.assignments || []);
        setEnrollments(data.enrollments || []);
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Failed to load instructor classroom data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInstructorData();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassCode.trim() || !newClassName.trim()) return;

    setIsCreatingClass(true);
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_class",
          code: newClassCode.trim().toUpperCase(),
          name: newClassName.trim(),
          department: newClassDept,
          term: newClassTerm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsClassModalOpen(false);
        setNewClassCode("");
        setNewClassName("");
        await fetchInstructorData();
      } else {
        alert(data.error || "Failed to create class.");
      }
    } finally {
      setIsCreatingClass(false);
    }
  };

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetClassId || !asgTitle.trim()) return;

    setIsCreatingAsg(true);
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_assignment",
          classId: targetClassId,
          title: asgTitle.trim(),
          description: asgDesc.trim(),
          dueDate: asgDueDate || new Date(Date.now() + 86400000 * 14).toISOString(),
          allowStudentViewReport: asgAllowReport,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAsgModalOpen(false);
        setAsgTitle("");
        setAsgDesc("");
        await fetchInstructorData();
      } else {
        alert(data.error || "Failed to create assignment.");
      }
    } finally {
      setIsCreatingAsg(false);
    }
  };

  const handleToggleAssignmentReport = async (assignmentId: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_report_visibility",
          assignmentId,
          allowStudentViewReport: !currentVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInstructorData();
      }
    } catch (err) {
      console.error("Error toggling report visibility:", err);
    }
  };

  const handleToggleSubmissionReport = async (submissionId: string, currentVal: boolean) => {
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_report_visibility",
          submissionId,
          allowStudentViewReport: !currentVal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchInstructorData();
      }
    } catch (err) {
      console.error("Error toggling submission report:", err);
    }
  };

  const openGradingModal = (sub: any) => {
    setGradingSub(sub);
    setGradeInput(sub.grade !== null ? sub.grade : 90);
    setFeedbackInput(sub.feedback || "");
    setAllowReportForThisSub(Boolean(sub.allowStudentViewReport));
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;

    setIsSubmittingGrade(true);
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade_submission",
          submissionId: gradingSub.id,
          grade: gradeInput,
          feedback: feedbackInput,
          allowStudentViewReport: allowReportForThisSub,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGradingSub(null);
        await fetchInstructorData();
      } else {
        alert(data.error || "Failed to save grade.");
      }
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return "N/A";
    return new Date(isoStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* ---------------- HEADER ---------------- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Classes &amp; Grading
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Course Manager: Create assignments, control plagiarism visibility, and grade cohort submissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsClassModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200/90 text-slate-800 text-xs font-semibold hover:bg-slate-50 shadow-2xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Create Class</span>
          </button>
          <button
            onClick={() => {
              if (classes.length > 0) setTargetClassId(classes[0].id);
              setIsAsgModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Assignment</span>
          </button>
          <button
            onClick={fetchInstructorData}
            disabled={refreshing}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Refresh Classroom Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* ---------------- CLASSES SUMMARY CARDS ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {classes.map((cls) => {
          const classEnrollments = enrollments.filter((e) => e.classId === cls.id);
          const classAsgs = assignments.filter((a) => a.classId === cls.id);
          return (
            <div
              key={cls.id}
              className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 font-mono text-xs font-bold border border-slate-200">
                    {cls.code}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {cls.term}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{cls.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{cls.department}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{classEnrollments.length} Students</span>
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>{classAsgs.length} Assignments</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------- SECTION: ASSIGNMENTS & PLAGIARISM VISIBILITY TOGGLES ---------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Class Assignments &amp; Visibility Controls</h2>
            <p className="text-xs text-slate-500">
              Manage whether students can see their plagiarism similarity score upon submission.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Assignment Title</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Student Plagiarism Report Status</th>
                <th className="py-3 px-5 text-right">Visibility Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assignments.map((asg) => (
                <tr key={asg.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-5 font-semibold text-slate-800">
                    {asg.title}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {asg.className}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {formatDate(asg.dueDate)}
                  </td>
                  <td className="py-3.5 px-4">
                    {asg.allowStudentViewReport ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                        <Eye className="w-3 h-3 text-emerald-600" />
                        <span>Visible to Students</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Restricted / Hidden from Students</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => handleToggleAssignmentReport(asg.id, asg.allowStudentViewReport)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                        asg.allowStudentViewReport
                          ? "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                          : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                      }`}
                    >
                      {asg.allowStudentViewReport ? "Hide Reports" : "Release Reports to Students"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- SECTION: STUDENT SUBMISSIONS & GRADING ---------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Student Submissions &amp; Grading Queue</h2>
            <p className="text-xs text-slate-500">
              Instructors always view full similarity results and can award grades and feedback.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-5">Student / File</th>
                <th className="py-3 px-4">Assignment</th>
                <th className="py-3 px-4">Originality Similarity</th>
                <th className="py-3 px-4">Grade &amp; Feedback</th>
                <th className="py-3 px-4">Student Visibility</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                  {/* Student & File */}
                  <td className="py-3.5 px-5">
                    <div className="font-bold text-slate-800">{sub.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{sub.fileTitle}</div>
                  </td>

                  {/* Assignment */}
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800">{sub.assignmentTitle}</div>
                    <div className="text-[10px] text-slate-400">{sub.className}</div>
                  </td>

                  {/* Instructor Always Sees Full Plagiarism Score */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          sub.similarityScore > 50
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : sub.similarityScore > 20
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {sub.similarityScore}% Overlap
                      </span>
                      {sub.reportJobId && (
                        <Link
                          href={`/report/${sub.reportJobId}`}
                          target="_blank"
                          className="text-slate-400 hover:text-emerald-600 transition"
                          title="Open Full Similarity Report"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  </td>

                  {/* Grade */}
                  <td className="py-3.5 px-4">
                    {sub.grade !== null ? (
                      <div>
                        <span className="font-extrabold text-emerald-700 text-xs">
                          {sub.grade} / 100 ({sub.gradeLetter})
                        </span>
                        {sub.feedback && (
                          <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                            {sub.feedback}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                        Ungraded
                      </span>
                    )}
                  </td>

                  {/* Report Visibility to Student */}
                  <td className="py-3.5 px-4">
                    <button
                      onClick={() => handleToggleSubmissionReport(sub.id, sub.allowStudentViewReport)}
                      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold border transition ${
                        sub.allowStudentViewReport
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                      }`}
                    >
                      {sub.allowStudentViewReport ? (
                        <>
                          <Eye className="w-3 h-3 text-emerald-600" />
                          <span>Student can view</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Hidden from student</span>
                        </>
                      )}
                    </button>
                  </td>

                  {/* Grade Button */}
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => openGradingModal(sub)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold shadow-2xs transition flex items-center gap-1.5 ml-auto"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>{sub.grade !== null ? "Edit Grade" : "Grade Work"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- MODAL: CREATE CLASS ---------------- */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Class</h3>
              <button onClick={() => setIsClassModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateClass} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Class Code (Unique)</label>
                <input
                  type="text"
                  required
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value.toUpperCase())}
                  placeholder="e.g. CS-205"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course Name</label>
                <input
                  type="text"
                  required
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  placeholder="e.g. Algorithms & Complexity"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newClassDept}
                    onChange={(e) => setNewClassDept(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Term</label>
                  <input
                    type="text"
                    value={newClassTerm}
                    onChange={(e) => setNewClassTerm(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingClass}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                >
                  {isCreatingClass ? "Creating..." : "Save Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: CREATE ASSIGNMENT ---------------- */}
      {isAsgModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Class Assignment</h3>
              <button onClick={() => setIsAsgModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Class</label>
                <select
                  value={targetClassId}
                  onChange={(e) => setTargetClassId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assignment Title</label>
                <input
                  type="text"
                  required
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  placeholder="e.g. Lab 4: Dynamic Programming Matrix"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Instructions / Description</label>
                <textarea
                  rows={3}
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  placeholder="Submission criteria, word limits, or required test cases..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Toggle for Plagiarism Visibility */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-800">
                    Allow Students to View Plagiarism Report
                  </div>
                  <div className="text-[11px] text-slate-500">
                    If OFF, similarity percentage remains hidden from students until released.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAsgAllowReport(!asgAllowReport)}
                  className={`p-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                    asgAllowReport
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                  }`}
                >
                  {asgAllowReport ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                  <span>{asgAllowReport ? "ON" : "OFF"}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAsgModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAsg}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                >
                  {isCreatingAsg ? "Saving..." : "Create Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: GRADE SUBMISSION ---------------- */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Grade Student Submission</h3>
                <p className="text-xs text-slate-500">{gradingSub.studentName} — {gradingSub.fileTitle}</p>
              </div>
              <button onClick={() => setGradingSub(null)} className="text-slate-400 hover:text-slate-600 text-sm font-semibold">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Plagiarism Score</span>
                <span className="font-extrabold text-slate-800">{gradingSub.similarityScore}% Similarity</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Grade / Score (0 to 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={gradeInput}
                  onChange={(e) => setGradeInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instructor Feedback / Comments
                </label>
                <textarea
                  rows={3}
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder="Commendations, source citation warnings, or grading rubric notes..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Toggle to release plagiarism score to this specific student */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-emerald-900">
                    Release Plagiarism Report to Student
                  </div>
                  <div className="text-[10px] text-emerald-700">
                    Allow student to inspect their {gradingSub.similarityScore}% similarity breakdown.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowReportForThisSub}
                  onChange={(e) => setAllowReportForThisSub(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSub(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGrade}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                >
                  {isSubmittingGrade ? "Saving..." : "Save Grade & Feedback"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
