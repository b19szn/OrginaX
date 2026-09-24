import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runComparisonJob } from "@/lib/queue/jobRunner";

export async function POST() {
  try {
    // 1. Ensure Demo User exists
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "Dr. Eleanor Vance",
          email: "evaluator@university.edu",
          role: "TEACHER",
        },
      });
    }

    // 2. Demo Pair 1: Text / Academic Abstract
    const textA =
      "The rapid proliferation of multimodal deep learning models has revolutionized automated content evaluation. However, cross-artifact plagiarism detection requires projecting heterogeneous representations into a shared semantic manifold. In this paper, we propose a cross-modality alignment framework capable of mapping text, source code ASTs, and visual raster diagrams into unified metric spaces.";

    const textB =
      "The swift expansion of multimodal deep neural architectures has transformed modern automated content appraisal. Nonetheless, cross-artifact similarity analysis demands projecting disparate data representations onto a joint semantic manifold. Here, we present a cross-modality alignment system designed to map textual tokens, code AST structures, and visual raster images into unified feature spaces.";

    const subText = await prisma.submission.create({
      data: {
        userId: user.id,
        title: "Benchmark 1: Academic Paper vs Paraphrased Summary",
        artifacts: {
          create: [
            {
              type: "TEXT",
              originalFileUrl: "/uploads/demo-text-original.txt",
              normalizedText: textA,
            },
            {
              type: "TEXT",
              originalFileUrl: "/uploads/demo-text-paraphrased.txt",
              normalizedText: textB,
            },
          ],
        },
      },
      include: { artifacts: true },
    });

    const jobText = await prisma.comparisonJob.create({
      data: {
        submissionId: subText.id,
        artifactAId: subText.artifacts[0].id,
        artifactBId: subText.artifacts[1].id,
        status: "PENDING",
      },
    });
    await runComparisonJob(jobText.id);

    // 3. Demo Pair 2: Code / Algorithm Refactoring
    const codeA = `def shortest_path_bfs(graph, start_node, target_node):
    """
    Computes the shortest unweighted path using Breadth-First Search.
    """
    queue = [(start_node, [start_node])]
    visited = set([start_node])
    
    while len(queue) > 0:
        current, path = queue.pop(0)
        if current == target_node:
            return path
            
        for neighbor in graph.get(current, []):
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append((neighbor, path + [neighbor]))
                
    return None`;

    const codeB = `def find_min_route_breadth(adj_map, src, dest):
    # Search for minimal path with FIFO structure
    worklist = [(src, [src])]
    seen = set([src])
    
    while len(worklist) > 0:
        curr_vertex, track = worklist.pop(0)
        if curr_vertex == dest:
            return track
            
        for adjacent in adj_map.get(curr_vertex, []):
            if adjacent not in seen:
                seen.add(adjacent)
                worklist.append((adjacent, track + [adjacent]))
                
    return None`;

    const subCode = await prisma.submission.create({
      data: {
        userId: user.id,
        title: "Benchmark 2: Python BFS Algorithm vs Refactored Code",
        artifacts: {
          create: [
            {
              type: "CODE",
              originalFileUrl: "/uploads/demo-code-original.py",
              normalizedText: codeA,
              language: "python",
            },
            {
              type: "CODE",
              originalFileUrl: "/uploads/demo-code-refactored.py",
              normalizedText: codeB,
              language: "python",
            },
          ],
        },
      },
      include: { artifacts: true },
    });

    const jobCode = await prisma.comparisonJob.create({
      data: {
        submissionId: subCode.id,
        artifactAId: subCode.artifacts[0].id,
        artifactBId: subCode.artifacts[1].id,
        status: "PENDING",
      },
    });
    await runComparisonJob(jobCode.id);

    // 4. Demo Pair 3: Image / Diagram Comparison
    const subImage = await prisma.submission.create({
      data: {
        userId: user.id,
        title: "Benchmark 3: System Architecture Diagram vs Visual Derivative",
        artifacts: {
          create: [
            {
              type: "IMAGE",
              originalFileUrl: "/uploads/demo-arch-original.png",
              normalizedText: "Diagram: Multi-Modal Similarity Architecture Pipeline",
            },
            {
              type: "IMAGE",
              originalFileUrl: "/uploads/demo-arch-derivative.png",
              normalizedText: "Diagram: Derivative Multi-Modal Workflow Layout",
            },
          ],
        },
      },
      include: { artifacts: true },
    });

    const jobImage = await prisma.comparisonJob.create({
      data: {
        submissionId: subImage.id,
        artifactAId: subImage.artifacts[0].id,
        artifactBId: subImage.artifacts[1].id,
        status: "PENDING",
      },
    });
    await runComparisonJob(jobImage.id);

    return NextResponse.json({
      success: true,
      message: "Benchmark datasets successfully seeded and analyzed.",
      jobs: [jobText.id, jobCode.id, jobImage.id],
    });
  } catch (err: any) {
    console.error("Demo seeding error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to seed demo data." },
      { status: 500 }
    );
  }
}
