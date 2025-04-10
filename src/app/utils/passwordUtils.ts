
export const verifyPassword = (password: string): boolean => {
  const envPassword = process.env.NEXT_PUBLIC_ENCRYPTED_FOLDER_PASSWORD;

  return password === envPassword;
};
