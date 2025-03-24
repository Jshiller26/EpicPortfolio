import { FileSystemItem } from '../types/fileSystem';

export const searchFileSystem = (
  items: Record<string, FileSystemItem>,
  query: string
): FileSystemItem[] => {
  if (!query || query.trim() === '') {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: FileSystemItem[] = [];

  // Search through all items
  Object.values(items).forEach(item => {
    if (!item.name) return;

    const name = item.name.toLowerCase();
    const path = item.path?.toLowerCase() || '';
    
    if (
      name.includes(normalizedQuery) || 
      path.includes(normalizedQuery)
    ) {
      results.push(item);
    }
  });

  // Sort results by relevance
  return results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    
    // Exact name matches first
    if (aName === normalizedQuery && bName !== normalizedQuery) return -1;
    if (bName === normalizedQuery && aName !== normalizedQuery) return 1;
    
    // Starts with matches next
    if (aName.startsWith(normalizedQuery) && !bName.startsWith(normalizedQuery)) return -1;
    if (bName.startsWith(normalizedQuery) && !aName.startsWith(normalizedQuery)) return 1;
    
    // Partial name matches next
    if (aName.includes(normalizedQuery) && !bName.includes(normalizedQuery)) return -1;
    if (bName.includes(normalizedQuery) && !aName.includes(normalizedQuery)) return 1;
    
    // Last sort by name
    return aName.localeCompare(bName);
  });
};
