import React, { useState, useEffect, useRef } from 'react';
import Editor, { Monaco } from "@monaco-editor/react";
import { useFileSystemStore } from '@/app/stores/fileSystemStore';
import { Save, Check } from 'lucide-react';

interface BlankTextEditorProps {
  windowId: string;
}

const BlankTextEditor: React.FC<BlankTextEditorProps> = ({ }) => {
  const fileSystem = useFileSystemStore();
  const [content, setContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('Untitled.txt');
  const [language] = useState<string>('plaintext');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setIsLoading(false);
    
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setContent(value);
      setIsDirty(true);
    }
  };
  
  const findLeftSidePosition = () => {
    let existingPositions: Record<string, {x: number, y: number}> = {};
    try {
      const saved = localStorage.getItem('desktopIconPositions');
      if (saved) {
        existingPositions = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading icon positions:', error);
    }
    
    let vsCodePosition = { x: 0, y: 0 };
    try {
      const savedVsCode = localStorage.getItem('vsCodeIconPosition');
      if (savedVsCode) {
        vsCodePosition = JSON.parse(savedVsCode);
      }
    } catch (error) {
      console.error('Error loading VS Code position:', error);
    }
    
    const allPositions = [
      ...Object.values(existingPositions),
      vsCodePosition
    ];
    
    const GRID_SIZE = 76;
    
    let x = 0;
    let y = 0;
    let found = false;
    
    while (!found && y < window.innerHeight - 100) {
      if (!allPositions.some(pos => pos.x === x && pos.y === y)) {
        found = true;
        break;
      }
      y += GRID_SIZE;
    }
    
    if (!found) {
      x = GRID_SIZE;
      y = 0;
      while (!found && y < window.innerHeight - 100) {
        if (!allPositions.some(pos => pos.x === x && pos.y === y)) {
          found = true;
          break;
        }
        y += GRID_SIZE;
      }
    }
    
    if (!found) {
      return { x: 0, y: 0 };
    }
    
    return { x, y };
  };
  
  const handleSave = () => {
    const desktopFolder = fileSystem.items['desktop'];
    
    if (desktopFolder && desktopFolder.type === 'folder') {
      let finalFileName = fileName;
      let counter = 1;
      
      while (desktopFolder.children.some(childId => {
        const child = fileSystem.items[childId];
        return child && child.name === finalFileName;
      })) {
        const nameParts = fileName.split('.');
        const ext = nameParts.pop() || 'txt';
        const baseName = nameParts.join('.');
        finalFileName = `${baseName} (${counter}).${ext}`;
        counter++;
      }
      
      const newFileId = fileSystem.createFile(finalFileName, 'desktop', content);
      
      const leftPosition = findLeftSidePosition();
      
      // Update the icon positions in localStorage
      try {
        let iconPositions: Record<string, {x: number, y: number}> = {};
        
        const saved = localStorage.getItem('desktopIconPositions');
        if (saved) {
          iconPositions = JSON.parse(saved);
        }
        
        // Add the new file's position
        iconPositions[newFileId] = leftPosition;
        
        // Save back to localStorage
        localStorage.setItem('desktopIconPositions', JSON.stringify(iconPositions));
      } catch (error) {
        console.error('Error saving icon positions:', error);
      }
      
      // Update state
      setFileName(finalFileName);
      setIsDirty(false);
      setSaveSuccess(true);
      
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
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editor.lineHighlightBorder': '#2a2d2e00'
      }
    });
    
    monaco.editor.setTheme('customTheme');
    
    // Update editor DOM to make line highlight more subtle
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .monaco-editor .current-line {
        border-width: 0 !important;
        background-color: rgba(42, 45, 46, 0.3) !important;
      }
    `;
    document.head.appendChild(styleElement);
  };

  // Count the number of lines in the content
  const lineCount = content.split('\n').length;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#1e1e1e] text-white relative">
      <div className="absolute inset-0 bottom-9">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-gray-500">Loading editor...</span>
          </div>
        ) : (
          <Editor
            height="100%"
            defaultLanguage={language}
            defaultValue=""
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
              lineNumbersMinChars: 3,
              renderLineHighlight: 'line',
              renderLineHighlightOnlyWhenFocus: false,
              lineHeight: 1.5
            }}
          />
        )}
      </div>
      
      {/* Combined status bar with all information and save button */}
      <div className="absolute bottom-0 left-0 right-0 h-9 bg-[#007acc] text-white flex items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="text-xs">{fileName} - {language}</div>
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

export default BlankTextEditor;