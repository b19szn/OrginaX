import { NextRequest, NextResponse } from "next/server";
import {
  getStudentClassroomView,
  getInstructorClassroomView,
  enrollInClass,
  submitAssignmentWork,
  createClass,
  createAssignment,
  gradeSubmission,
  toggleReportVisibility,
} from "@/lib/classroom/store";
import { getAuthenticatedUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "student"; // "student" | "instructor"
    const studentEmail = searchParams.get("email") || "";
    const studentName = searchParams.get("name") || "";

    const user = await getAuthenticatedUser();
    const effectiveEmail = studentEmail || user?.email || "alex.rivera@berkeley.edu";
    const effectiveName = studentName || user?.name || "Student Researcher";

    if (view === "instructor") {
      const data = getInstructorClassroomView();
      return NextResponse.json({ success: true, ...data });
    } else {
      const data = getStudentClassroomView(effectiveEmail, effectiveName);
      return NextResponse.json({ success: true, ...data });
    }
  } catch (err: any) {
    console.error("GET /api/classroom error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    const user = await getAuthenticatedUser();

    switch (action) {
      case "enroll": {
        const { code, studentEmail, studentName } = body;
        const email = studentEmail || user?.email || "alex.rivera@berkeley.edu";
        const name = studentName || user?.name || "Student Researcher";
        const res = enrollInClass(code, email, name);
        return NextResponse.json(res);
      }

      case "submit_work": {
        const { assignmentId, fileTitle, fileType, submissionText, fileUrl, studentEmail, studentName } = body;
        const email = studentEmail || user?.email || "alex.rivera@berkeley.edu";
        const name = studentName || user?.name || "Student Researcher";
        const res = submitAssignmentWork({
          assignmentId,
          studentEmail: email,
          studentName: name,
          fileTitle,
          fileType,
          submissionText,
          fileUrl,
        });
        return NextResponse.json(res);
      }

      case "create_class": {
        const { code, name, department, term, description, instructorName, instructorEmail } = body;
        const res = createClass({
          code,
          name,
          department,
          term,
          description,
          instructorName: instructorName || user?.name || "Dr. Eleanor Vance",
          instructorEmail: instructorEmail || user?.email || "evaluator@university.edu",
        });
        return NextResponse.json(res);
      }

      case "create_assignment": {
        const { classId, title, description, dueDate, maxScore, allowStudentViewReport } = body;
        const res = createAssignment({
          classId,
          title,
          description,
          dueDate,
          maxScore: Number(maxScore) || 100,
          allowStudentViewReport: Boolean(allowStudentViewReport),
        });
        return NextResponse.json(res);
      }

      case "grade_submission": {
        const { submissionId, grade, feedback, allowStudentViewReport } = body;
        const res = gradeSubmission({
          submissionId,
          grade: Number(grade),
          feedback,
          allowStudentViewReport,
        });
        return NextResponse.json(res);
      }

      case "toggle_report_visibility": {
        const { assignmentId, submissionId, allowStudentViewReport } = body;
        const res = toggleReportVisibility({
          assignmentId,
          submissionId,
          allowStudentViewReport: Boolean(allowStudentViewReport),
        });
        return NextResponse.json(res);
      }

      default:
        return NextResponse.json({ success: false, error: "Invalid action provided." }, { status: 400 });
    }
  } catch (err: any) {
    console.error("POST /api/classroom error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
