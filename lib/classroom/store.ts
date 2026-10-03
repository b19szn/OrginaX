import fs from "fs";
import path from "path";

export interface ClassroomClass {
  id: string;
  code: string; // e.g. "CS-101"
  name: string;
  instructorName: string;
  instructorEmail: string;
  department: string;
  term: string;
  description: string;
  createdAt: string;
}

export interface ClassroomAssignment {
  id: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  allowStudentViewReport: boolean; // Visibility toggle
  createdAt: string;
}

export interface ClassroomEnrollment {
  id: string;
  classId: string;
  studentEmail: string;
  studentName: string;
  enrolledAt: string;
}

export interface ClassroomSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  classId: string;
  className: string;
  studentEmail: string;
  studentName: string;
  fileTitle: string;
  fileType: "TEXT" | "CODE" | "IMAGE" | "PDF";
  submissionText?: string;
  similarityScore: number;
  reportJobId: string; // Links to /report/[jobId]
  status: "SUBMITTED" | "GRADED";
  grade: number | null; // e.g. 94
  gradeLetter: string | null; // e.g. "A"
  feedback: string | null;
  allowStudentViewReport: boolean; // Can be toggled per submission or inherit from assignment
  submittedAt: string;
  gradedAt: string | null;
}

export interface ClassroomData {
  classes: ClassroomClass[];
  assignments: ClassroomAssignment[];
  enrollments: ClassroomEnrollment[];
  submissions: ClassroomSubmission[];
}

const dataDir = path.join(process.cwd(), "data");
const dataFilePath = path.join(dataDir, "classroom.json");

function getDefaultData(): ClassroomData {
  return {
    classes: [
      {
        id: "class-cs101",
        code: "CS-101",
        name: "Data Structures & Algorithms",
        instructorName: "Dr. Eleanor Vance",
        instructorEmail: "evaluator@university.edu",
        department: "Computer Science",
        term: "Fall 2026",
        description: "Foundational data structures, sorting algorithms, and graph theory.",
        createdAt: "2026-09-01T08:00:00.000Z",
      },
      {
        id: "class-se302",
        code: "SE-302",
        name: "Software Engineering Capstone",
        instructorName: "Dr. Eleanor Vance",
        instructorEmail: "evaluator@university.edu",
        department: "Software Engineering",
        term: "Fall 2026",
        description: "Full-stack system architecture, microservices, and automated testing.",
        createdAt: "2026-09-02T08:00:00.000Z",
      },
      {
        id: "class-eng204",
        code: "ENG-204",
        name: "Academic Writing & Research Ethics",
        instructorName: "Prof. Marcus Sterling",
        instructorEmail: "evaluator@university.edu",
        department: "Humanities & Ethics",
        term: "Fall 2026",
        description: "Scholarly citation standards, literature reviews, and publication ethics.",
        createdAt: "2026-09-03T08:00:00.000Z",
      },
    ],
    assignments: [
      {
        id: "asg-1",
        classId: "class-cs101",
        className: "Data Structures & Algorithms",
        title: "Assignment 1: Graph BFS & Shortest Path",
        description: "Implement BFS traversal in Python or C++. Ensure comments and time complexity analysis are included.",
        dueDate: "2026-10-05T23:59:59.000Z",
        maxScore: 100,
        allowStudentViewReport: true, // Instructor allowed students to see plagiarism score
        createdAt: "2026-09-10T10:00:00.000Z",
      },
      {
        id: "asg-2",
        classId: "class-cs101",
        className: "Data Structures & Algorithms",
        title: "Assignment 2: Red-Black Tree Balancing",
        description: "Write recursive tree rotation procedures. Cross-checked with cohort code repository.",
        dueDate: "2026-10-18T23:59:59.000Z",
        maxScore: 100,
        allowStudentViewReport: false, // Report hidden from students by instructor
        createdAt: "2026-09-15T10:00:00.000Z",
      },
      {
        id: "asg-3",
        classId: "class-se302",
        className: "Software Engineering Capstone",
        title: "Milestone 1: Architecture Specification Paper",
        description: "Submit a 5-page PDF detailing component diagrams and database schema design.",
        dueDate: "2026-10-25T23:59:59.000Z",
        maxScore: 100,
        allowStudentViewReport: true, // Report visible to student
        createdAt: "2026-09-20T10:00:00.000Z",
      },
    ],
    enrollments: [
      {
        id: "enr-1",
        classId: "class-cs101",
        studentEmail: "alex.rivera@berkeley.edu",
        studentName: "Alex Rivera",
        enrolledAt: "2026-09-05T09:00:00.000Z",
      },
      {
        id: "enr-2",
        classId: "class-se302",
        studentEmail: "alex.rivera@berkeley.edu",
        studentName: "Alex Rivera",
        enrolledAt: "2026-09-05T09:00:00.000Z",
      },
    ],
    submissions: [
      {
        id: "sub-1",
        assignmentId: "asg-1",
        assignmentTitle: "Assignment 1: Graph BFS & Shortest Path",
        classId: "class-cs101",
        className: "Data Structures & Algorithms",
        studentEmail: "alex.rivera@berkeley.edu",
        studentName: "Alex Rivera",
        fileTitle: "BFS_ShortestPath_Implementation.py",
        fileType: "CODE",
        similarityScore: 12.4, // Low similarity - original
        reportJobId: "cmuekjt130006oqhojwv5cdzs",
        status: "GRADED",
        grade: 95,
        gradeLetter: "A",
        feedback: "Outstanding implementation with optimal queue data structures and comprehensive edge case testing.",
        allowStudentViewReport: true, // Student CAN view this report
        submittedAt: "2026-09-12T14:32:00.000Z",
        gradedAt: "2026-09-14T11:20:00.000Z",
      },
      {
        id: "sub-2",
        assignmentId: "asg-2",
        assignmentTitle: "Assignment 2: Red-Black Tree Balancing",
        classId: "class-cs101",
        className: "Data Structures & Algorithms",
        studentEmail: "alex.rivera@berkeley.edu",
        studentName: "Alex Rivera",
        fileTitle: "RedBlackTree_Rotations.cpp",
        fileType: "CODE",
        similarityScore: 78.5, // High similarity
        reportJobId: "cmuekjt3p000coqho51fpdvnd",
        status: "GRADED",
        grade: 82,
        gradeLetter: "B",
        feedback: "Correct rotation logic, but control flow shares structural derivation with textbook reference.",
        allowStudentViewReport: false, // Report HIDDEN from student by instructor
        submittedAt: "2026-09-17T16:45:00.000Z",
        gradedAt: "2026-09-19T09:15:00.000Z",
      },
    ],
  };
}

export function loadClassroomData(): ClassroomData {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(dataFilePath)) {
      const initial = getDefaultData();
      fs.writeFileSync(dataFilePath, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(dataFilePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error reading classroom data, using default:", err);
    return getDefaultData();
  }
}

export function saveClassroomData(data: ClassroomData): void {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving classroom data:", err);
  }
}

// Student views
export function getStudentClassroomView(studentEmail: string, studentName?: string) {
  const data = loadClassroomData();
  const normalizedEmail = (studentEmail || "alex.rivera@berkeley.edu").trim().toLowerCase();

  // Auto-enroll if student is new to give them a great immediate experience
  const hasEnrollments = data.enrollments.some(
    (e) => e.studentEmail.toLowerCase() === normalizedEmail
  );
  if (!hasEnrollments && data.classes.length > 0) {
    // Enroll in the first 2 classes by default
    data.enrollments.push(
      {
        id: `enr-${Date.now()}-1`,
        classId: data.classes[0].id,
        studentEmail: normalizedEmail,
        studentName: studentName || "Student",
        enrolledAt: new Date().toISOString(),
      },
      {
        id: `enr-${Date.now()}-2`,
        classId: data.classes[1] ? data.classes[1].id : data.classes[0].id,
        studentEmail: normalizedEmail,
        studentName: studentName || "Student",
        enrolledAt: new Date().toISOString(),
      }
    );

    // Create sample submissions for student so they see visibility policy behavior immediately
    if (data.assignments.length >= 2) {
      data.submissions.push(
        {
          id: `sub-demo-1-${Date.now()}`,
          assignmentId: data.assignments[0].id,
          assignmentTitle: data.assignments[0].title,
          classId: data.assignments[0].classId,
          className: data.assignments[0].className,
          studentEmail: normalizedEmail,
          studentName: studentName || "Student",
          fileTitle: "Graph_Shortest_Path_Solution.py",
          fileType: "CODE",
          similarityScore: 14.2,
          reportJobId: "cmuekjt130006oqhojwv5cdzs",
          status: "GRADED",
          grade: 94,
          gradeLetter: "A",
          feedback: "Great algorithmic logic and clean asymptotic documentation.",
          allowStudentViewReport: true, // Report visible to student!
          submittedAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
          gradedAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
        },
        {
          id: `sub-demo-2-${Date.now()}`,
          assignmentId: data.assignments[1].id,
          assignmentTitle: data.assignments[1].title,
          classId: data.assignments[1].classId,
          className: data.assignments[1].className,
          studentEmail: normalizedEmail,
          studentName: studentName || "Student",
          fileTitle: "Tree_Rotation_Algorithm.cpp",
          fileType: "CODE",
          similarityScore: 82.5,
          reportJobId: "cmuekjt3p000coqho51fpdvnd",
          status: "GRADED",
          grade: 86,
          gradeLetter: "B",
          feedback: "Good structural code, but check internal variable names and comments.",
          allowStudentViewReport: false, // Report HIDDEN by instructor
          submittedAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
          gradedAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        }
      );
    }
    saveClassroomData(data);
  }

  // Get enrolled class IDs
  const enrolledClassIds = new Set(
    data.enrollments
      .filter((e) => e.studentEmail.toLowerCase() === normalizedEmail)
      .map((e) => e.classId)
  );

  const enrolledClasses = data.classes.filter((c) => enrolledClassIds.has(c.id));
  const availableClasses = data.classes.filter((c) => !enrolledClassIds.has(c.id));

  // Get assignments for enrolled classes
  const assignments = data.assignments.filter((a) => enrolledClassIds.has(a.classId));

  // Get student submissions
  // POLICY RULE: If allowStudentViewReport is FALSE, MASK the similarity score and remove reportJobId!
  const submissions = data.submissions
    .filter((s) => s.studentEmail.toLowerCase() === normalizedEmail)
    .map((s) => {
      // Find parent assignment to check default toggle if not overridden
      const parentAsg = data.assignments.find((a) => a.id === s.assignmentId);
      const isReportAllowed = s.allowStudentViewReport ?? parentAsg?.allowStudentViewReport ?? false;

      if (!isReportAllowed) {
        return {
          ...s,
          allowStudentViewReport: false,
          similarityScore: null as any, // Masked from student!
          reportJobId: null as any, // No report URL accessible
          reportHiddenReason: "Plagiarism similarity report is hidden by instructor (institutional policy).",
        };
      }
      return {
        ...s,
        allowStudentViewReport: true,
      };
    });

  return {
    enrolledClasses,
    availableClasses,
    assignments,
    submissions,
  };
}

// Instructor views (sees all data with full similarity scores, grades, and toggles)
export function getInstructorClassroomView() {
  const data = loadClassroomData();
  return {
    classes: data.classes,
    assignments: data.assignments,
    enrollments: data.enrollments,
    submissions: data.submissions, // Full similarity scores always visible to instructor
  };
}

// Student action: Enroll in class by Code
export function enrollInClass(code: string, studentEmail: string, studentName: string) {
  const data = loadClassroomData();
  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = studentEmail.trim().toLowerCase();

  const targetClass = data.classes.find(
    (c) => c.code.toUpperCase() === normalizedCode || c.id === code
  );

  if (!targetClass) {
    throw new Error(`No class found with class code: "${code}". Please check with your instructor.`);
  }

  const existing = data.enrollments.find(
    (e) => e.classId === targetClass.id && e.studentEmail.toLowerCase() === normalizedEmail
  );

  if (existing) {
    return { success: true, message: "Already enrolled in this class.", class: targetClass };
  }

  const newEnrollment: ClassroomEnrollment = {
    id: `enr-${Date.now()}`,
    classId: targetClass.id,
    studentEmail: normalizedEmail,
    studentName: studentName || "Student",
    enrolledAt: new Date().toISOString(),
  };

  data.enrollments.push(newEnrollment);
  saveClassroomData(data);
  return { success: true, message: `Successfully enrolled in ${targetClass.name}!`, class: targetClass };
}

// Student action: Submit work
export function submitAssignmentWork(payload: {
  assignmentId: string;
  studentEmail: string;
  studentName: string;
  fileTitle: string;
  fileType: "TEXT" | "CODE" | "IMAGE" | "PDF";
  submissionText?: string;
  fileUrl?: string;
}) {
  const data = loadClassroomData();
  const assignment = data.assignments.find((a) => a.id === payload.assignmentId);
  if (!assignment) {
    throw new Error("Assignment not found.");
  }

  // Calculate realistic demo similarity score between 8% and 35%
  const simulatedScore = Math.round((Math.random() * 26 + 8) * 10) / 10;

  const newSubmission: ClassroomSubmission = {
    id: `sub-${Date.now()}`,
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    classId: assignment.classId,
    className: assignment.className,
    studentEmail: payload.studentEmail.trim().toLowerCase(),
    studentName: payload.studentName,
    fileTitle: payload.fileTitle || "Submitted_Work.pdf",
    fileType: payload.fileType || "TEXT",
    submissionText: payload.submissionText,
    similarityScore: simulatedScore,
    reportJobId: "cmuekjt130006oqhojwv5cdzs", // Real sample report
    status: "SUBMITTED",
    grade: null,
    gradeLetter: null,
    feedback: null,
    allowStudentViewReport: assignment.allowStudentViewReport, // Inherit assignment toggle
    submittedAt: new Date().toISOString(),
    gradedAt: null,
  };

  data.submissions.unshift(newSubmission);
  saveClassroomData(data);
  return { success: true, submission: newSubmission };
}

// Instructor action: Create Class
export function createClass(payload: {
  code: string;
  name: string;
  instructorName: string;
  instructorEmail: string;
  department: string;
  term: string;
  description: string;
}) {
  const data = loadClassroomData();
  const normalizedCode = payload.code.trim().toUpperCase();

  if (data.classes.some((c) => c.code.toUpperCase() === normalizedCode)) {
    throw new Error(`A class with code "${normalizedCode}" already exists.`);
  }

  const newClass: ClassroomClass = {
    id: `class-${Date.now()}`,
    code: normalizedCode,
    name: payload.name.trim(),
    instructorName: payload.instructorName || "Dr. Eleanor Vance",
    instructorEmail: payload.instructorEmail || "evaluator@university.edu",
    department: payload.department || "Computer Science",
    term: payload.term || "Fall 2026",
    description: payload.description || "",
    createdAt: new Date().toISOString(),
  };

  data.classes.push(newClass);
  saveClassroomData(data);
  return { success: true, class: newClass };
}

// Instructor action: Create Assignment with report visibility toggle
export function createAssignment(payload: {
  classId: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  allowStudentViewReport: boolean; // Visibility toggle
}) {
  const data = loadClassroomData();
  const targetClass = data.classes.find((c) => c.id === payload.classId);
  if (!targetClass) {
    throw new Error("Class not found.");
  }

  const newAssignment: ClassroomAssignment = {
    id: `asg-${Date.now()}`,
    classId: targetClass.id,
    className: targetClass.name,
    title: payload.title.trim(),
    description: payload.description || "",
    dueDate: payload.dueDate || new Date(Date.now() + 86400000 * 14).toISOString(),
    maxScore: payload.maxScore || 100,
    allowStudentViewReport: Boolean(payload.allowStudentViewReport),
    createdAt: new Date().toISOString(),
  };

  data.assignments.push(newAssignment);
  saveClassroomData(data);
  return { success: true, assignment: newAssignment };
}

// Instructor action: Grade Submission
export function gradeSubmission(payload: {
  submissionId: string;
  grade: number;
  feedback?: string;
  allowStudentViewReport?: boolean;
}) {
  const data = loadClassroomData();
  const submission = data.submissions.find((s) => s.id === payload.submissionId);
  if (!submission) {
    throw new Error("Submission not found.");
  }

  submission.grade = Math.min(100, Math.max(0, payload.grade));
  if (submission.grade >= 90) submission.gradeLetter = "A";
  else if (submission.grade >= 80) submission.gradeLetter = "B";
  else if (submission.grade >= 70) submission.gradeLetter = "C";
  else if (submission.grade >= 60) submission.gradeLetter = "D";
  else submission.gradeLetter = "F";

  submission.status = "GRADED";
  submission.feedback = payload.feedback || "Submission reviewed by instructor.";
  submission.gradedAt = new Date().toISOString();

  if (payload.allowStudentViewReport !== undefined) {
    submission.allowStudentViewReport = payload.allowStudentViewReport;
  }

  saveClassroomData(data);
  return { success: true, submission };
}

// Instructor action: Toggle Plagiarism Report Visibility
export function toggleReportVisibility(payload: {
  assignmentId?: string;
  submissionId?: string;
  allowStudentViewReport: boolean;
}) {
  const data = loadClassroomData();

  if (payload.submissionId) {
    const sub = data.submissions.find((s) => s.id === payload.submissionId);
    if (sub) {
      sub.allowStudentViewReport = payload.allowStudentViewReport;
      saveClassroomData(data);
      return { success: true, target: "submission", allowStudentViewReport: sub.allowStudentViewReport };
    }
  }

  if (payload.assignmentId) {
    const asg = data.assignments.find((a) => a.id === payload.assignmentId);
    if (asg) {
      asg.allowStudentViewReport = payload.allowStudentViewReport;
      // Also update all existing submissions for this assignment
      data.submissions.forEach((s) => {
        if (s.assignmentId === payload.assignmentId) {
          s.allowStudentViewReport = payload.allowStudentViewReport;
        }
      });
      saveClassroomData(data);
      return { success: true, target: "assignment", allowStudentViewReport: asg.allowStudentViewReport };
    }
  }

  throw new Error("Target assignment or submission not found.");
}
