import React, { useState, useCallback } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@librechat/client';
import { MonacoEditor } from './MonacoEditor';
import { Download, Copy, Maximize2, Minimize2, FileCode, Check } from 'lucide-react';
import copy from 'copy-to-clipboard';

interface CodeEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  defaultCode?: string;
  language?: string;
  onSave?: (code: string) => void;
  readOnly?: boolean;
  fileName?: string;
}

export const CodeEditorDialog: React.FC<CodeEditorDialogProps> = ({
  open,
  onOpenChange,
  title = 'Code Editor',
  defaultCode = '',
  language = 'javascript',
  onSave,
  readOnly = false,
  fileName = 'code.txt',
}) => {
  const [code, setCode] = useState(defaultCode);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editorInstance, setEditorInstance] = useState<monaco.editor.IStandaloneCodeEditor | null>(
    null,
  );

  const handleCodeChange = useCallback((value: string) => {
    setCode(value);
  }, []);

  const handleSave = useCallback(() => {
    onSave?.(code);
    onOpenChange(false);
  }, [code, onSave, onOpenChange]);

  const handleCopy = useCallback(() => {
    copy(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [code, fileName]);

  const handleFormat = useCallback(async () => {
    if (editorInstance) {
      await editorInstance.getAction('editor.action.formatDocument')?.run();
    }
  }, [editorInstance]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`${
          isFullscreen ? 'max-w-[100vw] h-[100vh] w-full' : 'max-w-6xl h-[80vh]'
        } flex flex-col`}
      >
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              <DialogTitle>{title}</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              {/* Toolbar buttons */}
              <button
                onClick={handleFormat}
                className="rounded p-2 hover:bg-surface-hover"
                title="Format Code (Shift+Alt+F)"
                disabled={readOnly}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="opacity-70"
                >
                  <path d="M12.5 3.5h-9v1h9v-1zm0 4h-9v1h9v-1zm0 4h-9v1h9v-1z" />
                </svg>
              </button>
              <button
                onClick={handleCopy}
                className="rounded p-2 hover:bg-surface-hover"
                title="Copy Code"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 opacity-70" />
                )}
              </button>
              <button
                onClick={handleDownload}
                className="rounded p-2 hover:bg-surface-hover"
                title="Download Code"
              >
                <Download className="h-4 w-4 opacity-70" />
              </button>
              <button
                onClick={toggleFullscreen}
                className="rounded p-2 hover:bg-surface-hover"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4 opacity-70" />
                ) : (
                  <Maximize2 className="h-4 w-4 opacity-70" />
                )}
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden border border-border-medium rounded-md">
          <MonacoEditor
            value={code}
            language={language}
            onChange={handleCodeChange}
            onMount={setEditorInstance}
            height="100%"
            readOnly={readOnly}
            minimap={true}
            lineNumbers="on"
            fontSize={14}
            wordWrap="on"
            autoFormat={true}
          />
        </div>

        {!readOnly && onSave && (
          <div className="flex justify-end gap-2 mt-4 flex-shrink-0">
            <button
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-md hover:bg-surface-hover"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white"
            >
              Save Changes
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CodeEditorDialog;
