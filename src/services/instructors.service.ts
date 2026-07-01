import { adminApi } from "@/lib/admin-api";

// Create Instructor
export const createInstructor = async (payload: any) => {
  const { data } = await adminApi.post(`/admin/instructors`, payload);
  return data;
};

// Get All Instructors
export const getAllInstructors = async (search: any) => {
  const { data } = await adminApi.get(`/admin/instructors?search=${search}`);
  return data;
};

// Get a Specific Instructor
export const getInstructor = async (id: string) => {
  const { data } = await adminApi.get(`/admin/instructors/${id}`);
  return data;
};

// Update a Specific Instructor
export const updateInstructor = async (id: string, payload: any) => {
  const { data } = await adminApi.patch(`/admin/instructors/${id}`, payload);
  return data;
};

// Delete a Specific Instructor
export const deleteInstructor = async (id: string) => {
  const { data } = await adminApi.delete(`/admin/instructors/${id}`);
  return data;
};

// Delete Profile Image of a Specific Instructor
export const deleteInstructorImages = async (
  id: string,
  profileImagePublicId: string | undefined,
  coverImagePublicId: string | undefined,
) => {
  const { data } = await adminApi.delete(
    `/admin/instructors/${id}/profile_image?profileImagePublicId=${profileImagePublicId}&coverImagePublicId=${coverImagePublicId}`,
  );
  return data;
};
