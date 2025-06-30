import {
  getClassesByMonth,
  getClassDetails as getClassDetailsApi,
} from "@/api/class";

export const getClassCards = async (
  month: string,
  year: number = new Date().getFullYear()
) => {
  try {
    return await getClassesByMonth(month, year.toString());
  } catch (e) {
    throw new Error("Error!");
  }
};

export async function getClassDetails(classId: number) {
  try {
    return await getClassDetailsApi(classId);
  } catch (e) {
    throw new Error(`Failed to fetch class details: ${e}`);
  }
}
