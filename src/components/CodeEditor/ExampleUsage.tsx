/**
 * Example Usage File - Code Editor Components
 * 
 * This file demonstrates various ways to use the Monaco Editor components
 * in your LibreChat application.
 */

import React, { useState } from 'react';
import { MonacoEditor, CodeEditorDialog, CodeEditorPanel } from './index';
import * as monaco from 'monaco-editor';

// ============================================================================
// Example 1: Basic Editor
// ============================================================================

export function BasicEditorExample() {
  const [code, setCode] = useState('console.log("Hello World");');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Basic Editor</h2>
      <MonacoEditor
        value={code}
        language="javascript"
        onChange={setCode}
        height="400px"
      />
    </div>
  );
}

// ============================================================================
// Example 2: Editor with All Features
// ============================================================================

export function FullFeaturedEditorExample() {
  const [code, setCode] = useState('// Type your code here\n');
  const [language, setLanguage] = useState('typescript');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Full-Featured Editor</h2>
      
      <div className="mb-4">
        <label className="mr-2">Language:</label>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="cpp">C++</option>
        </select>
      </div>

      <CodeEditorPanel
        defaultCode={code}
        defaultLanguage={language}
        height="600px"
        showToolbar={true}
        title="Code Editor"
        onExecute={(code) => {
          console.log('Executing:', code);
          alert('Code execution would happen here!');
        }}
      />
    </div>
  );
}

// ============================================================================
// Example 3: Dialog Editor
// ============================================================================

export function DialogEditorExample() {
  const [open, setOpen] = useState(false);
  const [savedCode, setSavedCode] = useState('');

  const handleSave = (code: string) => {
    setSavedCode(code);
    console.log('Code saved:', code);
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Dialog Editor</h2>
      
      <button 
        onClick={() => setOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Code Editor
      </button>

      {savedCode && (
        <div className="mt-4">
          <h3 className="font-semibold">Saved Code:</h3>
          <pre className="bg-gray-100 p-2 rounded mt-2">{savedCode}</pre>
        </div>
      )}

      <CodeEditorDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Your Code"
        defaultCode="function hello() {\n  console.log('Hello!');\n}"
        language="javascript"
        onSave={handleSave}
      />
    </div>
  );
}

// ============================================================================
// Example 4: Read-Only Code Viewer
// ============================================================================

export function ReadOnlyEditorExample() {
  const codeToDisplay = `
// This is a read-only code viewer
const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};

console.log(fibonacci(10)); // 55
  `.trim();

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Read-Only Viewer</h2>
      <MonacoEditor
        value={codeToDisplay}
        language="javascript"
        readOnly={true}
        height="300px"
        minimap={false}
      />
    </div>
  );
}

// ============================================================================
// Example 5: Diff Editor (Compare Code)
// ============================================================================

export function DiffEditorExample() {
  const originalCode = `function add(a, b) {
  return a + b;
}`;

  const modifiedCode = `function add(a, b) {
  // Added type safety
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Arguments must be numbers');
  }
  return a + b;
}`;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Diff Editor (Side-by-Side)</h2>
      <p className="mb-4 text-gray-600">Compare original vs modified code</p>
      
      <MonacoEditor
        showDiffEditor={true}
        originalValue={originalCode}
        value={modifiedCode}
        language="javascript"
        height="400px"
        readOnly={true}
      />
    </div>
  );
}

// ============================================================================
// Example 6: Editor with Custom Configuration
// ============================================================================

export function CustomConfigEditorExample() {
  const [code, setCode] = useState('SELECT * FROM users WHERE age > 18;');

  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // Add custom keyboard shortcut
    editor.addAction({
      id: 'execute-query',
      label: 'Execute SQL Query',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter],
      run: (ed) => {
        const code = ed.getValue();
        console.log('Executing SQL:', code);
        alert('SQL Query Executed!');
      },
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">SQL Editor with Custom Shortcuts</h2>
      <p className="mb-2 text-sm text-gray-600">Press Cmd/Ctrl + Enter to execute</p>
      
      <MonacoEditor
        value={code}
        language="sql"
        onChange={setCode}
        onMount={handleMount}
        height="300px"
        options={{
          fontSize: 16,
          wordWrap: 'on',
          minimap: { enabled: false },
        }}
      />
    </div>
  );
}

// ============================================================================
// Example 7: Multi-Language Code Snippets
// ============================================================================

export function MultiLanguageExample() {
  const snippets = {
    javascript: 'console.log("Hello from JavaScript");',
    python: 'print("Hello from Python")',
    java: 'System.out.println("Hello from Java");',
    cpp: '#include <iostream>\nstd::cout << "Hello from C++" << std::endl;',
    rust: 'fn main() {\n    println!("Hello from Rust");\n}',
  };

  const [selectedLang, setSelectedLang] = useState<keyof typeof snippets>('javascript');

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Multi-Language Snippets</h2>
      
      <div className="flex gap-2 mb-4">
        {Object.keys(snippets).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLang(lang as keyof typeof snippets)}
            className={`px-3 py-1 rounded ${
              selectedLang === lang
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <MonacoEditor
        value={snippets[selectedLang]}
        language={selectedLang}
        height="250px"
        readOnly={true}
      />
    </div>
  );
}

// ============================================================================
// Example 8: Integration with Chat Interface
// ============================================================================

export function ChatCodeBlockExample() {
  const [showEditor, setShowEditor] = useState(false);
  const [codeFromAI, setCodeFromAI] = useState(`
function processData(data) {
  return data
    .filter(item => item.active)
    .map(item => ({
      ...item,
      processed: true
    }));
}
  `.trim());

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">AI Generated Code</h3>
        <button
          onClick={() => setShowEditor(!showEditor)}
          className="text-sm text-blue-500 hover:underline"
        >
          {showEditor ? 'Show Preview' : 'Edit in Editor'}
        </button>
      </div>

      {showEditor ? (
        <MonacoEditor
          value={codeFromAI}
          language="javascript"
          onChange={setCodeFromAI}
          height="300px"
        />
      ) : (
        <pre className="bg-gray-900 text-white p-4 rounded overflow-x-auto">
          <code>{codeFromAI}</code>
        </pre>
      )}
    </div>
  );
}

// ============================================================================
// Example 9: Code Playground with Execution
// ============================================================================

export function CodePlaygroundExample() {
  const [output, setOutput] = useState<string[]>([]);

  const handleExecute = (code: string) => {
    // WARNING: In production, execute in a sandboxed environment!
    try {
      // Capture console.log output
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args: any[]) => {
        logs.push(args.map(arg => String(arg)).join(' '));
      };

      // Execute code
      eval(code);

      // Restore console.log
      console.log = originalLog;

      setOutput(logs);
    } catch (error: any) {
      setOutput([`Error: ${error.message}`]);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Code Playground</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h3 className="font-semibold mb-2">Code</h3>
          <CodeEditorPanel
            defaultCode="console.log('Hello, World!');\nconsole.log(1 + 1);"
            defaultLanguage="javascript"
            onExecute={handleExecute}
            height="400px"
            showToolbar={true}
            title="JavaScript Playground"
          />
        </div>

        <div>
          <h3 className="font-semibold mb-2">Output</h3>
          <div className="bg-black text-green-400 p-4 rounded h-[400px] overflow-auto font-mono text-sm">
            {output.length > 0 ? (
              output.map((line, i) => <div key={i}>&gt; {line}</div>)
            ) : (
              <div className="text-gray-500">Click "Run" to see output...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Main Demo Component
// ============================================================================

export function CodeEditorDemo() {
  const [activeExample, setActiveExample] = useState(0);

  const examples = [
    { name: 'Basic Editor', component: <BasicEditorExample /> },
    { name: 'Full-Featured', component: <FullFeaturedEditorExample /> },
    { name: 'Dialog Editor', component: <DialogEditorExample /> },
    { name: 'Read-Only', component: <ReadOnlyEditorExample /> },
    { name: 'Diff Editor', component: <DiffEditorExample /> },
    { name: 'Custom Config', component: <CustomConfigEditorExample /> },
    { name: 'Multi-Language', component: <MultiLanguageExample /> },
    { name: 'Chat Integration', component: <ChatCodeBlockExample /> },
    { name: 'Playground', component: <CodePlaygroundExample /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Monaco Editor Examples</h1>

        <div className="flex gap-2 mb-6 flex-wrap">
          {examples.map((example, idx) => (
            <button
              key={idx}
              onClick={() => setActiveExample(idx)}
              className={`px-4 py-2 rounded ${
                activeExample === idx
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border hover:bg-gray-50'
              }`}
            >
              {example.name}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          {examples[activeExample].component}
        </div>
      </div>
    </div>
  );
}

export default CodeEditorDemo;
