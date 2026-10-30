import React, { useState } from 'react';
import { MonacoEditor } from './MonacoEditor';

export function MonacoTest() {
  const [code, setCode] = useState('// Test Monaco Editor\nconsole.log("Hello World!");');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Monaco Editor Test</h1>
      <div className="border border-border-medium rounded-lg overflow-hidden">
        <MonacoEditor
          value={code}
          language="javascript"
          onChange={setCode}
          height="400px"
        />
      </div>
      <div className="mt-4">
        <h3 className="font-semibold mb-2">Output:</h3>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded">{code}</pre>
      </div>
    </div>
  );
}

export default MonacoTest;
