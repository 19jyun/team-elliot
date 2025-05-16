export const getClassCards = async (
  month: string,
  year: number = new Date().getFullYear(),
) => {
  try {
    const response = await fetch(`/api/classes/month/${month}?year=${year}`)
    if (!response.ok) {
      console.log('test')
      throw new Error('Failed to fetch class cards')
    }
    return response.json()
  } catch (e) {
    throw new Error('Error!')
  }
}

export async function getClassDetails(classId: number) {
  const response = await fetch(`/api/classes/${classId}/details`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch class details: ${response.statusText}`)
  }

  return response.json()
}
