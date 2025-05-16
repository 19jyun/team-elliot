export async function getClassDetails(classId: number) {
  const response = await fetch(`/api/classes/${classId}/details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch class details')
  }

  return response.json()
}
