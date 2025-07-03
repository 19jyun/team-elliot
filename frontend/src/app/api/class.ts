export async function getClassDetails(classId: number) {
  const response = await fetch(`/api/classes/${classId}/details`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch class details");
  }

  return response.json();
}

export async function getClassSessions(classId: number) {
  const response = await fetch(`/api/classes/${classId}/sessions`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch class sessions");
  }

  return response.json();
}

export async function enrollSession(sessionId: number) {
  const response = await fetch(`/api/class-sessions/${sessionId}/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to enroll session");
  }

  return response.json();
}

export async function batchEnrollSessions(sessionIds: number[]) {
  const response = await fetch("/api/class-sessions/batch-enroll", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ sessionIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to batch enroll sessions");
  }

  return response.json();
}
