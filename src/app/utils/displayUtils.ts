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

export const formatSize = (bytes: number): string => {
  if (bytes === 0) {
    return '0 KB';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  if (i === 0) {
    return bytes + ' Bytes';
  }
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};