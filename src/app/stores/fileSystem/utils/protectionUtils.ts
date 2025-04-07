export const PROTECTED_ITEMS = ['desktop']; 

export const isProtectedItem = (itemId: string): boolean => {
  return PROTECTED_ITEMS.includes(itemId);
};
