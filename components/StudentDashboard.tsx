"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  UploadCloud,
  FileCheck,
  Lock,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  FileText,
  Code2,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  Search,
} from "lucide-react";

interface StudentDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role?: string;
  };
}

export default function StudentDashboard({ user }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState<"classes" | "assignments" | "grades">("classes");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [availableClasses, setAvailableClasses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  // Enrollment Modal state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [enrollCode, setEnrollCode] = useState("");
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState(false);

  // Submit Work Modal state
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [fileType, setFileType] = useState<"TEXT" | "CODE" | "PDF">("TEXT");
  const [submissionText, setSubmissionText] = useState("");
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Feedback popover modal
  const [activeFeedback, setActiveFeedback] = useState<any | null>(null);

  const fetchStudentData = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(
        `/api/classroom?view=student&email=${encodeURIComponent(user.email)}&name=${encodeURIComponent(user.name)}`
      );
      const data = await res.json();
      if (data.success) {
        setEnrolledClasses(data.enrolledClasses || []);
        setAvailableClasses(data.availableClasses || []);
        setAssignments(data.assignments || []);
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error("Failed to load student classroom data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user.email]);

  const handleEnroll = async (codeToUse?: string) => {
    const code = codeToUse || enrollCode;
    if (!code.trim()) {
      setEnrollError("Please enter a valid class code.");
      return;
    }
    setIsEnrolling(true);
    setEnrollError(null);
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "enroll",
          code: code.trim(),
          studentEmail: user.email,
          studentName: user.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEnrollModalOpen(false);
        setEnrollCode("");
        await fetchStudentData();
      } else {
        setEnrollError(data.error || "Failed to enroll in class.");
      }
    } catch (err: any) {
      setEnrollError(err.message || "Network error occurred.");
    } finally {
      setIsEnrolling(false);
    }
  };

  const openSubmitForAssignment = (assignmentId: string) => {
    setSelectedAssignmentId(assignmentId);
    const asg = assignments.find((a) => a.id === assignmentId);
    if (asg) {
      setFileTitle(`${user.name.replace(/\s+/g, "_")}_${asg.title.replace(/[^a-zA-Z0-9]/g, "_")}`);
    }
    setSubmitError(null);
    setIsSubmitModalOpen(true);
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentId) {
      setSubmitError("Please choose an assignment to submit work for.");
      return;
    }
    if (!fileTitle.trim()) {
      setSubmitError("Please provide a title for your submitted file.");
      return;
    }
    if (!submissionText.trim()) {
      setSubmitError("Please enter or paste your assignment text/code content.");
      return;
    }

    setIsSubmittingWork(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/classroom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_work",
          assignmentId: selectedAssignmentId,
          studentEmail: user.email,
          studentName: user.name,
          fileTitle: fileTitle.trim(),
          fileType,
          submissionText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSubmitModalOpen(false);
        setSubmissionText("");
        setFileTitle("");
        await fetchStudentData();
        setActiveTab("grades"); // Switch to submissions/grades view
      } else {
        setSubmitError(data.error || "Failed to submit assignment.");
      }
    } catch (err: any) {
      setSubmitError(err.message || "Network error occurred.");
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Helper to format dates
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
      {/* ---------------- STUDENT PORTAL HEADER ---------------- */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-800 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
              OriginaX Student Portal
            </span>
            <span className="text-xs text-slate-300">| Academic Year 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Enroll in classes, submit assignments, and review grades and originality reports released by your faculty instructors.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsEnrollModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-xs transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Enroll in Class</span>
          </button>
          <button
            onClick={fetchStudentData}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-emerald-400" : ""}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>

      {/* ---------------- NAVIGATION PILLS ---------------- */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("classes")}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === "classes"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Classes ({enrolledClasses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("assignments")}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === "assignments"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          <span>Submit Work ({assignments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("grades")}
          className={`pb-3 px-4 text-xs sm:text-sm font-semibold transition border-b-2 flex items-center gap-2 ${
            activeTab === "grades"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <FileCheck className="w-4 h-4" />
          <span>My Grades &amp; Reports ({submissions.length})</span>
        </button>
      </div>

      {/* ---------------- TAB 1: ENROLLED CLASSES ---------------- */}
      {activeTab === "classes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Your Enrolled Classes</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Classes you have joined using institutional enrollment codes.
              </p>
            </div>
            <button
              onClick={() => setIsEnrollModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium flex items-center gap-1.5 shadow-xs transition"
            >
              <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Join Another Class</span>
            </button>
          </div>

          {enrolledClasses.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-800">Not enrolled in any classes yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Ask your course instructor for your 5-character class code to join your cohort and submit papers.
              </p>
              <button
                onClick={() => setIsEnrollModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-700 transition"
              >
                Enter Class Code
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledClasses.map((cls) => {
                const classAssignments = assignments.filter((a) => a.classId === cls.id);
                return (
                  <div
                    key={cls.id}
                    className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-semibold border border-slate-200">
                          {cls.code}
                        </span>
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {cls.term}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">
                        {cls.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {cls.description || "Active university cohort."}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="text-slate-400">Instructor</span>
                        <span className="font-medium text-slate-800">{cls.instructorName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="text-slate-400">Active Assignments</span>
                        <span className="font-semibold text-emerald-700">{classAssignments.length}</span>
                      </div>
                      <button
                        onClick={() => setActiveTab("assignments")}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                      >
                        <span>View Class Assignments</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Quick Join Available Classes (Convenience for testing) */}
          {availableClasses.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-800 mb-3">
                Other Open Classes on Campus
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {availableClasses.map((ac) => (
                  <div
                    key={ac.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800">{ac.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">Code: {ac.code}</div>
                    </div>
                    <button
                      onClick={() => handleEnroll(ac.code)}
                      className="px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition shadow-2xs"
                    >
                      Join
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 2: ASSIGNMENTS & SUBMIT WORK ---------------- */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Assignments Due</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Submit papers, code repositories, or lab reports to your enrolled classes.
              </p>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs">
              <p className="text-sm text-slate-500">No active assignments in your enrolled classes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((asg) => {
                const existingSub = submissions.find((s) => s.assignmentId === asg.id);
                return (
                  <div
                    key={asg.id}
                    className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-5"
                  >
                    <div className="space-y-2 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {asg.className}
                        </span>
                        {asg.allowStudentViewReport ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Plagiarism Report Allowed</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            <span>Plagiarism Report Restricted</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900">{asg.title}</h3>
                      <p className="text-xs text-slate-500">{asg.description}</p>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Due: {formatDate(asg.dueDate)}</span>
                        </span>
                        <span>•</span>
                        <span>Max Points: {asg.maxScore || 100}</span>
                      </div>
                    </div>

                    <div className="shrink-0 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {existingSub ? (
                        <div className="space-y-1 text-right">
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Submitted ({formatDate(existingSub.submittedAt)})</span>
                          </div>
                          <div>
                            <button
                              onClick={() => setActiveTab("grades")}
                              className="text-xs text-emerald-700 hover:underline font-medium block"
                            >
                              Check Grade &amp; Score →
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => openSubmitForAssignment(asg.id)}
                          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition"
                        >
                          <UploadCloud className="w-4 h-4 text-emerald-400" />
                          <span>Submit Work</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ---------------- TAB 3: GRADES & PLAGIARISM REPORTS ---------------- */}
      {activeTab === "grades" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800">My Grades &amp; Originality Reports</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation results, instructor grading comments, and similarity scores.
              </p>
            </div>
          </div>

          {/* Academic Policy Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Academic Integrity Visibility Policy:</span> In accordance with institutional academic integrity policies, similarity percentages and full match breakdown reports are only disclosed if your course instructor has specifically enabled report access for that assignment.
            </div>
          </div>

          {submissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-2xs space-y-2">
              <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No submissions found</p>
              <p className="text-xs text-slate-400">Submit work under the "Submit Work" tab to see grades and similarity scores here.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3.5 px-5">Assignment / Class</th>
                      <th className="py-3.5 px-4">Submitted File</th>
                      <th className="py-3.5 px-4">Date</th>
                      <th className="py-3.5 px-4">Grade &amp; Feedback</th>
                      <th className="py-3.5 px-5 text-right">Plagiarism Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.map((sub) => {
                      const isReportReleased = sub.allowStudentViewReport === true && sub.similarityScore !== null;
                      return (
                        <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                          {/* Assignment / Class */}
                          <td className="py-4 px-5">
                            <div className="font-semibold text-slate-800 text-sm">{sub.assignmentTitle}</div>
                            <div className="text-[11px] text-slate-400">{sub.className}</div>
                          </td>

                          {/* Submitted File */}
                          <td className="py-4 px-4 font-mono text-[11px] text-slate-600">
                            <div className="flex items-center gap-1.5">
                              {sub.fileType === "CODE" ? (
                                <Code2 className="w-3.5 h-3.5 text-blue-500" />
                              ) : (
                                <FileText className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                              <span className="truncate max-w-[150px]">{sub.fileTitle}</span>
                            </div>
                          </td>

                          {/* Submission Date */}
                          <td className="py-4 px-4 text-slate-500">
                            {formatDate(sub.submittedAt)}
                          </td>

                          {/* Grade & Feedback */}
                          <td className="py-4 px-4">
                            {sub.grade !== null ? (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-extrabold text-emerald-700">
                                    {sub.grade} / 100
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                                    Grade: {sub.gradeLetter || "A"}
                                  </span>
                                </div>
                                {sub.feedback && (
                                  <button
                                    onClick={() => setActiveFeedback(sub)}
                                    className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 transition"
                                  >
                                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                                    <span>Read instructor comments</span>
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                                <Clock className="w-3 h-3" />
                                <span>Pending Evaluation</span>
                              </span>
                            )}
                          </td>

                          {/* Plagiarism Report Column */}
                          <td className="py-4 px-5 text-right">
                            {isReportReleased ? (
                              <div className="inline-flex flex-col items-end gap-1.5">
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
                                    {sub.similarityScore}% Similarity
                                  </span>
                                </div>
                                {sub.reportJobId && (
                                  <Link
                                    href={`/report/${sub.reportJobId}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
                                  >
                                    <span>View Full Report</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                )}
                              </div>
                            ) : (
                              <div className="inline-flex flex-col items-end gap-1">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium">
                                  <Lock className="w-3 h-3 text-slate-400" />
                                  <span>Report Hidden by Instructor</span>
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Similarity not released for this task
                                </span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- MODAL: ENROLL IN CLASS ---------------- */}
      {isEnrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Enroll in a Class</h3>
              </div>
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Enter the unique Class Code provided by your instructor (e.g. <code>CS-101</code>, <code>SE-302</code>, <code>ENG-204</code>).
            </p>

            {enrollError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {enrollError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class Code
              </label>
              <input
                type="text"
                value={enrollCode}
                onChange={(e) => setEnrollCode(e.target.value.toUpperCase())}
                placeholder="e.g. CS-101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsEnrollModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEnroll()}
                disabled={isEnrolling || !enrollCode.trim()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
              >
                {isEnrolling ? "Enrolling..." : "Enroll Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: SUBMIT WORK ---------------- */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Submit Assignment</h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmitWork} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Assignment
                </label>
                <select
                  value={selectedAssignmentId}
                  onChange={(e) => setSelectedAssignmentId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500 bg-white"
                >
                  <option value="">Select an assignment...</option>
                  {assignments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.className} — {a.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Submission File Title
                </label>
                <input
                  type="text"
                  required
                  value={fileTitle}
                  onChange={(e) => setFileTitle(e.target.value)}
                  placeholder="e.g. Graph_Algorithm_BFS_Solution.py"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modality
                </label>
                <div className="flex gap-2">
                  {(["TEXT", "CODE", "PDF"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFileType(t)}
                      className={`flex-1 py-1.5 text-xs rounded-xl font-medium border transition ${
                        fileType === t
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content (Paste paper text, report body, or source code)
                </label>
                <textarea
                  rows={6}
                  required
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  placeholder="Paste your document body, academic abstract, or code here for automatic plagiarism check..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingWork}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
                >
                  {isSubmittingWork ? "Submitting..." : "Turn in Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- MODAL: INSTRUCTOR FEEDBACK ---------------- */}
      {activeFeedback && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Faculty Evaluation</h3>
              </div>
              <button
                onClick={() => setActiveFeedback(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-400">Assignment</div>
              <div className="text-sm font-semibold text-slate-800">{activeFeedback.assignmentTitle}</div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-emerald-900">Score Awarded</span>
                <span className="text-base font-extrabold text-emerald-800">
                  {activeFeedback.grade} / 100 ({activeFeedback.gradeLetter})
                </span>
              </div>
              <p className="text-xs text-slate-700 italic">
                "{activeFeedback.feedback}"
              </p>
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActiveFeedback(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
