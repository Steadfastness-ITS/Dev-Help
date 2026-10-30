import React, { useState, useCallback } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { MonacoEditor } from './MonacoEditor';
import {
  Download,
  Copy,
  FileCode,
  Check,
  Settings,
  ChevronDown,
  Play,
  RotateCcw,
} from 'lucide-react';
import copy from 'copy-to-clipboard';

interface CodeEditorPanelProps {
  defaultCode?: string;
  defaultLanguage?: string;
  onExecute?: (code: string) => void;
  readOnly?: boolean;
  height?: string | number;
  showToolbar?: boolean;
  title?: string;
}

const LANGUAGES = [
  { id: 'javascript', name: 'JavaScript' },
  { id: 'typescript', name: 'TypeScript' },
  { id: 'python', name: 'Python' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'csharp', name: 'C#' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' },
  { id: 'php', name: 'PHP' },
  { id: 'ruby', name: 'Ruby' },
  { id: 'html', name: 'HTML' },
  { id: 'css', name: 'CSS' },
  { id: 'json', name: 'JSON' },
  { id: 'markdown', name: 'Markdown' },
  { id: 'sql', name: 'SQL' },
  { id: 'yaml', name: 'YAML' },
  { id: 'xml', name: 'XML' },
  { id: 'shell', name: 'Shell' },
];

export const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  defaultCode = '// Start coding...\n',
  defaultLanguage = 'javascript',
  onExecute,
  readOnly = false,
  height = '500px',
  showToolbar = true,
  title,
}) => {
  const [code, setCode] = useState(defaultCode);
  const [language, setLanguage] = useState(defaultLanguage);
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );
  const [fontSize, setFontSize] = useState(14);
  const [minimap, setMinimap] = useState(true);
  const [wordWrap, setWordWrap] = useState<'on' | 'off'>('on');
  const [lineNumbers, setLineNumbers] = useState<'on' | 'off'>('on');

  // Ensure unsupported languages fall back to plaintext
  const supportedLanguageIds = monaco.languages.getLanguages().map((l) => l.id);
  const effectiveLanguage = supportedLanguageIds.includes(language) ? language : 'plaintext';

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleCopy = useCallback(() => {
    copy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const extension = LANGUAGES.find((l) => l.id === language)?.id || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, language]);

  const handleFormat = useCallback(async () => {
    if (editorInstance) {
      await editorInstance.getAction('editor.action.formatDocument')?.run();
    }
  }, [editorInstance]);

  const handleReset = useCallback(() => {
    setCode(defaultCode);
  }, [defaultCode]);

  const handleExecute = useCallback(() => {
    onExecute?.(code);
  }, [code, onExecute]);

  // Add Ctrl/Cmd + Enter keybinding to execute code
  React.useEffect(() => {
    if (!editorInstance || !onExecute) return;
    const dispose = editorInstance.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: () => handleExecute(),
    });
    return () => {
      dispose.dispose();
    };
  }, [editorInstance, handleExecute, onExecute]);

  return (
    <div className="flex flex-col h-full border border-border-medium rounded-lg overflow-hidden bg-surface-primary">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-medium bg-surface-secondary">
          <div className="flex items-center gap-3">
            <FileCode className="h-4 w-4 text-text-secondary" />
            {title && <span className="text-sm font-medium text-text-primary">{title}</span>}
            
            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-surface-tertiary text-text-primary text-sm px-3 py-1 pr-8 rounded border border-border-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                disabled={readOnly}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Button */}
            <button
              onClick={handleFormat}
              className="p-1.5 rounded hover:bg-surface-hover"
              title="Format Code (Shift+Alt+F)"
              disabled={readOnly}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                className="text-text-secondary"
              >
                <path d="M12.5 3.5h-9v1h9v-1zm0 4h-9v1h9v-1zm0 4h-9v1h9v-1z" />
              </svg>
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded hover:bg-surface-hover"
              title="Copy Code"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 text-text-secondary" />
              )}
            </button>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              className="p-1.5 rounded hover:bg-surface-hover"
              title="Download Code"
            >
              <Download className="h-4 w-4 text-text-secondary" />
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              className="p-1.5 rounded hover:bg-surface-hover"
              title="Reset Code"
              disabled={readOnly}
            >
              <RotateCcw className="h-4 w-4 text-text-secondary" />
            </button>

            {/* Execute Button */}
            {onExecute && (
              <button
                onClick={handleExecute}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-green-600 hover:bg-green-700 text-white text-sm"
                title="Execute Code"
              >
                <Play className="h-3.5 w-3.5" />
                Run
              </button>
            )}

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-1.5 rounded hover:bg-surface-hover"
              title="Editor Settings"
            >
              <Settings className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="px-4 py-3 border-b border-border-medium bg-surface-secondary space-y-2">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-text-secondary">Font Size:</span>
              <input
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                min="10"
                max="30"
                className="w-16 px-2 py-1 bg-surface-tertiary border border-border-medium rounded text-text-primary"
              />
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={minimap}
                onChange={(e) => setMinimap(e.target.checked)}
                className="rounded"
              />
              <span className="text-text-secondary">Minimap</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={wordWrap === 'on'}
                onChange={(e) => setWordWrap(e.target.checked ? 'on' : 'off')}
                className="rounded"
              />
              <span className="text-text-secondary">Word Wrap</span>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={lineNumbers === 'on'}
                onChange={(e) => setLineNumbers(e.target.checked ? 'on' : 'off')}
                className="rounded"
              />
              <span className="text-text-secondary">Line Numbers</span>
            </label>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          value={code}
          language={effectiveLanguage}
          onChange={handleCodeChange}
          onMount={setEditorInstance}
          height="100%"
          readOnly={readOnly}
          minimap={minimap}
          lineNumbers={lineNumbers}
          fontSize={fontSize}
          wordWrap={wordWrap}
          autoFormat={true}
        />
      </div>
    </div>
  );
};

export default CodeEditorPanel;
