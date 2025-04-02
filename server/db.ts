// This is a dummy file since we're using in-memory storage
// We provide an empty object to satisfy imports but nothing here is used
export const db = {
  select: () => ({ from: () => ({ where: () => [] }) }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
};