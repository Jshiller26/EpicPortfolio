import React, { useState, useEffect } from 'react';
import Editor from "@monaco-editor/react";
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { File } from '@/app/types/fileSystem';

interface TextEditorProps {
  fileId: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ fileId }) => {
  const fileSystem = useFileSystemStore();
  const file = fileSystem.items[fileId] as File;
  const [content, setContent] = useState<string>(file?.content || '');
  const [language, setLanguage] = useState<string>('plaintext');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setIsLoading(false);
      
      // Set language based on file extension
      const languageMap: Record<string, string> = {
        'js': 'javascript',
        'jsx': 'javascript',
        'ts': 'typescript',
        'tsx': 'typescript',
        'html': 'html',
        'css': 'css',
        'json': 'json',
        'md': 'markdown',
        'py': 'python',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'php': 'php',
        'rb': 'ruby',
        'rs': 'rust',
        'swift': 'swift',
        'sql': 'sql',
        'sh': 'shell',
        'yml': 'yaml',
        'yaml': 'yaml',
        'xml': 'xml',
        'txt': 'plaintext'
      };
      
      const extension = file.extension.toLowerCase();
      setLanguage(languageMap[extension] || 'plaintext');
    }
  }, [file, fileId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      // Update file content in store
      fileSystem.items[fileId] = {
        ...file,
        content: value,
        modified: new Date()
      };
    }
  };

  const handleEditorDidMount = () => {
    setIsLoading(false);
  };

  if (!file) {
    return <div className="p-4">File not found</div>;
  }

  return (
    <div className="h-full w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <span className="text-gray-500">Loading editor...</span>
        </div>
      ) : (
        <Editor
          height="100%"
          defaultLanguage={language}
          defaultValue={content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            fontSize: 14,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible'
            },
            fontFamily: 'Consolas, "Courier New", monospace',
            lineNumbers: 'on',
            theme: 'vs-light'
          }}
        />
      )}
    </div>
  );
};

export default TextEditor;