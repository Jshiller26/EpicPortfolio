import React, { useState, useRef, useEffect } from 'react';

interface PasswordDialogProps {
  folderId: string;
  folderName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PasswordDialog: React.FC<PasswordDialogProps> = ({
  folderName,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) setError(false);
  };

  const verifyEncryptedFolderPassword = (password: string) => {
    const folderPassword = process.env.NEXT_PUBLIC_ENCRYPTED_FOLDER_PASSWORD;
    return password === folderPassword;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (verifyEncryptedFolderPassword(password)) {
      onSuccess();
    } else {
      setError(true);
      setPassword('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="bg-[#F0F0F0] h-full flex flex-col">
      <div className="p-6 pb-3 flex-grow">
        <div className="text-center mb-5">
          <p className="text-sm mb-2">Enter password for the encrypted folder</p>
          <p className="text-sm font-medium text-red-600">{folderName}</p>
        </div>
        
        <div className="mt-6">
          <label className="block text-sm mb-2">Enter password</label>
          <input
            ref={inputRef}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#0078D7]"
          />
          {error && (
            <p className="text-red-500 text-xs mt-1">
              The password is incorrect. Please try again.
            </p>
          )}
        </div>
        
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={() => setShowPassword(!showPassword)}
              className="mr-2 form-checkbox border-gray-300"
            />
            <span className="text-sm">Show password</span>
          </label>
        </div>
      </div>
      
      <div className="p-3 flex justify-end space-x-2 bg-[#F0F0F0] border-t border-gray-300">
        <button
          onClick={handleSubmit}
          className="bg-[#0078D7] hover:bg-[#0067B8] text-white px-6 py-1 rounded text-sm"
        >
          OK
        </button>
        <button
          onClick={onClose}
          className="bg-[#E1E1E1] hover:bg-[#D1D1D1] px-6 py-1 rounded text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};