import React, { useState, useEffect, useRef } from 'react';
import Editor, { Monaco } from "@monaco-editor/react";
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { File } from '@/app/types/fileSystem';
import { Save, Check } from 'lucide-react';

interface TextEditorProps {
  fileId: string;
}

const TextEditor: React.FC<TextEditorProps> = ({ fileId }) => {
  const fileSystem = useFileSystemStore();
  const file = fileSystem.items[fileId] as File;
  const [content, setContent] = useState<string>(file?.content || '');
  const [originalContent, setOriginalContent] = useState<string>(file?.content || '');
  const [language, setLanguage] = useState<string>('plaintext');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (file) {
      setContent(file.content);
      setOriginalContent(file.content);
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
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [file, fileId]);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setIsDirty(value !== originalContent);
    }
  };
  
  const handleSave = () => {
    if (file) {
      // Update file content in store
      fileSystem.items[fileId] = {
        ...file,
        content: content,
        modified: new Date()
      };
      
      setOriginalContent(content);
      setIsDirty(false);
      setSaveSuccess(true);
      
      // Clear the success indicator after a delay
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      
      saveTimerRef.current = setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    }
  };

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    setIsLoading(false);
    
    // Configure editor
    monaco.editor.defineTheme('customTheme', {
      base: 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41'
      }
    });
    
    monaco.editor.setTheme('customTheme');
  };

  if (!file) {
    return <div className="p-4">File not found</div>;
  }

  const lineCount = content.split('\n').length;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#1e1e1e] text-white">
      <div className="flex-grow relative">
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
            theme="customTheme"
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
              fontFamily: '"Cascadia Code", Consolas, "Courier New", monospace',
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3
            }}
          />
        )}
      </div>
      
      {/* Combined status bar with all information and save button */}
      <div className="px-4 py-2 bg-[#007acc] text-white flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-xs">{file.name} - {language}</div>
          <div className="text-xs">
            Ln {editorRef.current?.getPosition()?.lineNumber || 1}, 
            Col {editorRef.current?.getPosition()?.column || 1} | 
            {isDirty ? " Modified" : " Saved"}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleSave}
            disabled={!isDirty}
            className={`flex items-center px-3 py-1 rounded text-sm ${
              isDirty 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saveSuccess ? (
              <>
                <Check size={16} className="mr-1" />
                Saved
              </>
            ) : (
              <>
                <Save size={16} className="mr-1" />
                Save
              </>
            )}
          </button>
          
          <div className="text-xs">{lineCount} Lines</div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;