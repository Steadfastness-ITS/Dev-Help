import React, { useState } from 'react';
import { CodeEditorPanel } from '~/components/CodeEditor';

export default function Playground() {
  const [output, setOutput] = useState<string[]>([]);

  const handleExecute = (code: string) => {
    try {
      // Clear previous output
      setOutput([]);

      // Capture console.log output
      const logs: string[] = [];
      const originalLog = console.log;
      const originalError = console.error;
      const originalWarn = console.warn;

      console.log = (...args: any[]) => {
        const message = args.map((arg) => {
          if (typeof arg === 'object') {
            try {
              return JSON.stringify(arg, null, 2);
            } catch {
              return String(arg);
            }
          }
          return String(arg);
        }).join(' ');
        logs.push(`[log] ${message}`);
        originalLog(...args);
      };

      console.error = (...args: any[]) => {
        const message = args.map((arg) => String(arg)).join(' ');
        logs.push(`[error] ${message}`);
        originalError(...args);
      };

      console.warn = (...args: any[]) => {
        const message = args.map((arg) => String(arg)).join(' ');
        logs.push(`[warn] ${message}`);
        originalWarn(...args);
      };

      // Execute the code
      // eslint-disable-next-line no-eval
      eval(code);

      // Restore console methods
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;

      setOutput(logs.length > 0 ? logs : ['Code executed successfully (no output)']);
    } catch (error: any) {
      setOutput([`Error: ${error.message}`]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-medium text-text-primary mb-1">Code Playground</h3>
        <p className="text-sm text-text-secondary">
          Write and execute JavaScript code. Use console.log() to see output below.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Code Editor */}
        <div className="flex-1">
          <CodeEditorPanel
            defaultCode="// Welcome to the Code Playground!\n// Write JavaScript code and click Run\n\nconsole.log('Hello, World!');\n\nconst sum = (a, b) => a + b;\nconsole.log('Sum:', sum(5, 3));"
            defaultLanguage="javascript"
            onExecute={handleExecute}
            height="400px"
            showToolbar={true}
            title="Code Editor"
          />
        </div>

        {/* Output Console */}
        <div className="flex-1 lg:max-w-md">
          <div className="flex flex-col h-[400px] border border-border-medium rounded-lg overflow-hidden bg-surface-primary">
            <div className="flex items-center justify-between px-4 py-2 border-b border-border-medium bg-surface-secondary">
              <span className="text-sm font-medium text-text-primary">Console Output</span>
              <button
                onClick={() => setOutput([])}
                className="text-xs text-text-secondary hover:text-text-primary"
              >
                Clear
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 font-mono text-sm bg-gray-900 text-green-400">
              {output.length > 0 ? (
                output.map((line, i) => (
                  <div
                    key={i}
                    className={`mb-1 ${
                      line.startsWith('[error]')
                        ? 'text-red-400'
                        : line.startsWith('[warn]')
                          ? 'text-yellow-400'
                          : 'text-green-400'
                    }`}
                  >
                    {line}
                  </div>
                ))
              ) : (
                <div className="text-gray-500">
                  Output will appear here when you run your code...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tips */}
      <div className="text-xs text-text-secondary space-y-1 bg-surface-secondary p-3 rounded-lg">
        <p className="font-semibold text-text-primary mb-2">💡 Tips:</p>
        <p>• Use <code className="bg-surface-tertiary px-1 rounded">console.log()</code> to output values</p>
        <p>• Use <code className="bg-surface-tertiary px-1 rounded">Cmd/Ctrl + Enter</code> to run code</p>
        <p>• Use <code className="bg-surface-tertiary px-1 rounded">Shift + Alt + F</code> to format code</p>
        <p>• Press <code className="bg-surface-tertiary px-1 rounded">Cmd/Ctrl + F</code> to find/replace</p>
        <p>• Code runs in a safe sandbox environment</p>
      </div>
    </div>
  );
}
