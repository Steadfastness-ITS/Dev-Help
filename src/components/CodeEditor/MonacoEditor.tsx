import React, { useRef, useEffect, useState } from 'react';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import 'monaco-editor/min/vs/editor/editor.main.css';
import { useTheme } from '@librechat/client';

export interface MonacoEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  theme?: 'vs-dark' | 'vs-light' | 'hc-black' | 'hc-light';
  readOnly?: boolean;
  onChange?: (value: string) => void;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
  height?: string | number;
  width?: string | number;
  className?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  minimap?: boolean;
  lineNumbers?: 'on' | 'off' | 'relative' | 'interval';
  fontSize?: number;
  wordWrap?: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  autoFormat?: boolean;
  showDiffEditor?: boolean;
  originalValue?: string;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  defaultValue = '',
  language = 'javascript',
  theme,
  readOnly = false,
  onChange,
  onMount,
  height = '400px',
  width = '100%',
  className = '',
  options = {},
  minimap = true,
  lineNumbers = 'on',
  fontSize = 14,
  wordWrap = 'on',
  autoFormat = true,
  showDiffEditor = false,
  originalValue = '',
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const diffEditorInstanceRef = useRef<monaco.editor.IStandaloneDiffEditor | null>(null);
  const [isEditorReady, setIsEditorReady] = useState(false);
  const { theme: appTheme } = useTheme();

  // Determine theme based on app theme if not explicitly set
  const editorTheme = theme || (appTheme === 'dark' ? 'vs-dark' : 'vs-light');

  useEffect(() => {
    if (!editorRef.current) {
      return;
    }

    // Default editor options
    const defaultOptions: monaco.editor.IStandaloneEditorConstructionOptions = {
      value: value || defaultValue,
      language,
      theme: editorTheme,
      readOnly,
      automaticLayout: true,
      minimap: { enabled: minimap },
      lineNumbers,
      fontSize,
      wordWrap,
      scrollBeyondLastLine: false,
      renderWhitespace: 'selection',
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: autoFormat,
      formatOnType: autoFormat,
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      quickSuggestions: {
        other: true,
        comments: true,
        strings: true,
      },
      parameterHints: { enabled: true },
      folding: true,
      foldingStrategy: 'indentation',
      showFoldingControls: 'always',
      bracketPairColorization: { enabled: true },
      guides: {
        bracketPairs: true,
        indentation: true,
      },
      ...options,
    };

    // Create editor or diff editor
    if (showDiffEditor && originalValue) {
      const originalModel = monaco.editor.createModel(originalValue, language);
      const modifiedModel = monaco.editor.createModel(value || defaultValue, language);

      diffEditorInstanceRef.current = monaco.editor.createDiffEditor(editorRef.current, {
        ...defaultOptions,
        readOnly,
        enableSplitViewResizing: true,
        renderSideBySide: true,
      });

      diffEditorInstanceRef.current.setModel({
        original: originalModel,
        modified: modifiedModel,
      });

      // Listen to changes on modified model
      modifiedModel.onDidChangeContent(() => {
        const currentValue = modifiedModel.getValue();
        onChange?.(currentValue);
      });
    } else {
      editorInstanceRef.current = monaco.editor.create(editorRef.current, defaultOptions);

      // Listen to content changes
      editorInstanceRef.current.onDidChangeModelContent(() => {
        const currentValue = editorInstanceRef.current?.getValue() || '';
        onChange?.(currentValue);
      });

      // Call onMount callback
      if (onMount && editorInstanceRef.current) {
        onMount(editorInstanceRef.current);
      }
    }

    setIsEditorReady(true);

    // Cleanup
    return () => {
      editorInstanceRef.current?.dispose();
      diffEditorInstanceRef.current?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update value when prop changes
  useEffect(() => {
    if (isEditorReady && value !== undefined && editorInstanceRef.current) {
      const currentValue = editorInstanceRef.current.getValue();
      if (currentValue !== value) {
        editorInstanceRef.current.setValue(value);
      }
    }
  }, [value, isEditorReady]);

  // Update theme when it changes
  useEffect(() => {
    if (isEditorReady) {
      monaco.editor.setTheme(editorTheme);
    }
  }, [editorTheme, isEditorReady]);

  // Update language when it changes
  useEffect(() => {
    if (isEditorReady && editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language, isEditorReady]);

  // Update readOnly when it changes
  useEffect(() => {
    if (isEditorReady && editorInstanceRef.current) {
      editorInstanceRef.current.updateOptions({ readOnly });
    }
  }, [readOnly, isEditorReady]);

  return (
    <div
      ref={editorRef}
      className={`monaco-editor-container ${className}`}
      style={{
        height: typeof height === 'number' ? `${height}px` : height,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    />
  );
};

// Helper function to get supported languages
export const getSupportedLanguages = () => {
  return monaco.languages.getLanguages().map((lang) => lang.id);
};

// Helper function to format code
export const formatCode = async (
  editor: monaco.editor.IStandaloneCodeEditor,
): Promise<void> => {
  await editor.getAction('editor.action.formatDocument')?.run();
};

// Helper function to add custom theme
export const defineCustomTheme = (
  themeName: string,
  themeData: monaco.editor.IStandaloneThemeData,
) => {
  monaco.editor.defineTheme(themeName, themeData);
};

export default MonacoEditor;
