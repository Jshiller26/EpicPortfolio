export const getDisplayName = (fileName: string): string => {
  if (!fileName.includes('.')) {
    return fileName;
  }
  
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex > 0) {
    return fileName.substring(0, lastDotIndex);
  }
  
  return fileName;
};
