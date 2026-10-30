# Monaco Editor Setup Guide

## 📦 Installation

### 1. Install Monaco Editor

```bash
npm install monaco-editor
# or
yarn add monaco-editor
```

### 2. Configure Vite for Monaco Editor

Monaco Editor requires special worker configuration for Vite. Update your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';

export default defineConfig({
  plugins: [
    react(),
    monacoEditorPlugin({
      languageWorkers: ['editorWorkerService', 'typescript', 'json', 'html', 'css'],
    }),
  ],
  // ... rest of your config
});
```

**Alternative**: Manual worker setup without plugin:

Add this to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  // ... other config
  optimizeDeps: {
    include: ['monaco-editor'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
        },
      },
    },
  },
});
```

Then create a worker configuration file at `src/monaco-workers.ts`:

```typescript
import * as monaco from 'monaco-editor';
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';

self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker();
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker();
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker();
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker();
    }
    return new editorWorker();
  },
};
```

Import this in your `main.jsx` or `App.jsx`:

```typescript
import './monaco-workers';
```

---

## 🎨 Usage Examples

### Basic Usage

```tsx
import { MonacoEditor } from '~/components/CodeEditor';

function MyComponent() {
  const [code, setCode] = useState('console.log("Hello World");');

  return (
    <MonacoEditor
      value={code}
      language="javascript"
      onChange={setCode}
      height="400px"
    />
  );
}
```

### Full-Featured Panel

```tsx
import { CodeEditorPanel } from '~/components/CodeEditor';

function CodePlayground() {
  const handleExecute = (code: string) => {
    console.log('Executing code:', code);
    // Your execution logic here
  };

  return (
    <CodeEditorPanel
      defaultCode="// Write your code here\n"
      defaultLanguage="typescript"
      onExecute={handleExecute}
      height="600px"
      showToolbar={true}
      title="Code Playground"
    />
  );
}
```

### Dialog Usage

```tsx
import { CodeEditorDialog } from '~/components/CodeEditor';

function MyComponent() {
  const [open, setOpen] = useState(false);

  const handleSave = (code: string) => {
    console.log('Saved code:', code);
    // Save logic here
  };

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Editor</button>
      
      <CodeEditorDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit Code"
        defaultCode="const x = 42;"
        language="typescript"
        onSave={handleSave}
      />
    </>
  );
}
```

### Diff Editor (Compare Two Versions)

```tsx
import { MonacoEditor } from '~/components/CodeEditor';

function DiffView() {
  const originalCode = 'const x = 1;';
  const modifiedCode = 'const x = 2;';

  return (
    <MonacoEditor
      showDiffEditor={true}
      originalValue={originalCode}
      value={modifiedCode}
      language="javascript"
      height="500px"
      readOnly={true}
    />
  );
}
```

### Custom Theme

```tsx
import { defineCustomTheme, MonacoEditor } from '~/components/CodeEditor';

// Define custom theme
defineCustomTheme('myCustomTheme', {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: '569CD6' },
    { token: 'string', foreground: 'CE9178' },
  ],
  colors: {
    'editor.background': '#1e1e1e',
    'editor.foreground': '#d4d4d4',
    'editor.lineHighlightBackground': '#2a2a2a',
    'editorCursor.foreground': '#aeafad',
  },
});

function CustomThemedEditor() {
  return (
    <MonacoEditor
      value="console.log('Custom Theme');"
      language="javascript"
      theme="myCustomTheme"
    />
  );
}
```

---

## 🔧 Advanced Configuration

### With TypeScript Definitions

```tsx
import { MonacoEditor } from '~/components/CodeEditor';
import * as monaco from 'monaco-editor';

function TypeScriptEditor() {
  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // Add custom type definitions
    monaco.languages.typescript.typescriptDefaults.addExtraLib(
      `
      declare module 'my-custom-module' {
        export function myFunction(): void;
      }
      `,
      'my-custom-module.d.ts'
    );

    // Configure compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ES2020,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.CommonJS,
      noEmit: true,
      esModuleInterop: true,
      jsx: monaco.languages.typescript.JsxEmit.React,
      reactNamespace: 'React',
      allowJs: true,
      typeRoots: ['node_modules/@types'],
    });
  };

  return (
    <MonacoEditor
      value="import { myFunction } from 'my-custom-module';\nmyFunction();"
      language="typescript"
      onMount={handleMount}
    />
  );
}
```

### Custom Keyboard Shortcuts

```tsx
function EditorWithCustomKeybindings() {
  const handleMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    // Add custom keybinding
    editor.addAction({
      id: 'my-custom-save',
      label: 'Save File',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: (editor) => {
        const code = editor.getValue();
        console.log('Saving:', code);
        // Your save logic
      },
    });

    // Add custom command
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      console.log('Custom command triggered');
    });
  };

  return <MonacoEditor onMount={handleMount} />;
}
```

### Multi-File Editor

```tsx
import { useState } from 'react';
import { MonacoEditor } from '~/components/CodeEditor';

interface File {
  name: string;
  language: string;
  content: string;
}

function MultiFileEditor() {
  const [files, setFiles] = useState<File[]>([
    { name: 'index.ts', language: 'typescript', content: 'export const x = 42;' },
    { name: 'styles.css', language: 'css', content: 'body { margin: 0; }' },
  ]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const handleCodeChange = (value: string) => {
    setFiles((prev) =>
      prev.map((file, idx) => (idx === activeFileIndex ? { ...file, content: value } : file))
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* File Tabs */}
      <div className="flex gap-2 border-b border-border-medium bg-surface-secondary px-2">
        {files.map((file, idx) => (
          <button
            key={idx}
            onClick={() => setActiveFileIndex(idx)}
            className={`px-4 py-2 text-sm ${
              idx === activeFileIndex
                ? 'bg-surface-primary border-t-2 border-green-500'
                : 'hover:bg-surface-hover'
            }`}
          >
            {file.name}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div className="flex-1">
        <MonacoEditor
          value={files[activeFileIndex].content}
          language={files[activeFileIndex].language}
          onChange={handleCodeChange}
          height="100%"
        />
      </div>
    </div>
  );
}
```

---

## 🎯 Integration Points in LibreChat

### 1. Add to Settings Panel

Add a new "Code Editor" tab in settings:

```tsx
// In src/components/Nav/SettingsTabs/
import { CodeEditorPanel } from '~/components/CodeEditor';

export function CodeEditorSettings() {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Code Playground</h3>
      <CodeEditorPanel
        defaultLanguage="javascript"
        height="500px"
        showToolbar={true}
      />
    </div>
  );
}
```

### 2. Add to Chat Messages

Use for code blocks in messages:

```tsx
// In src/components/Messages/Content/
import { MonacoEditor } from '~/components/CodeEditor';

export function CodeBlock({ code, language }: { code: string; language: string }) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
      <MonacoEditor
        value={code}
        language={language}
        height="300px"
        readOnly={false}
      />
    );
  }
  
  // Regular code block display
  return <pre><code>{code}</code></pre>;
}
```

### 3. Add to Artifacts

Replace Sandpack editor for certain use cases:

```tsx
// In src/components/Artifacts/
import { MonacoEditor } from '~/components/CodeEditor';

export function ArtifactEditor({ artifact }: { artifact: Artifact }) {
  // Use Monaco for plain code editing
  // Use Sandpack for live preview
  
  return artifact.type === 'code' ? (
    <MonacoEditor
      value={artifact.content}
      language={artifact.language}
    />
  ) : (
    <SandpackEditor /> // existing
  );
}
```

### 4. Add Standalone Code Playground Page

Create a new route:

```tsx
// In src/routes/CodePlayground.tsx
import { CodeEditorPanel } from '~/components/CodeEditor';

export function CodePlayground() {
  return (
    <div className="h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Code Playground</h1>
      <CodeEditorPanel
        defaultLanguage="javascript"
        onExecute={(code) => {
          // Execute code in sandboxed environment
          console.log('Execute:', code);
        }}
        height="calc(100vh - 120px)"
        showToolbar={true}
        title="Playground"
      />
    </div>
  );
}
```

Add route in `src/routes/index.tsx`:

```tsx
{
  path: 'playground',
  element: <CodePlayground />,
}
```

---

## 🎨 Supported Languages

Monaco Editor supports 50+ languages out of the box:

- JavaScript, TypeScript, JSX, TSX
- HTML, CSS, SCSS, LESS
- Python, Java, C++, C#, Go, Rust
- PHP, Ruby, Swift, Kotlin
- SQL, MySQL, PostgreSQL
- JSON, YAML, XML, Markdown
- Shell, Bash, PowerShell
- Dockerfile, Terraform
- GraphQL, SPARQL
- And many more...

---

## ⚙️ Features

### Built-in Features
- ✅ **IntelliSense** - Auto-completion
- ✅ **Syntax Highlighting** - All major languages
- ✅ **Error Detection** - Real-time linting
- ✅ **Code Formatting** - Prettier-like formatting
- ✅ **Find & Replace** - Advanced search
- ✅ **Multi-cursor** - Edit multiple lines
- ✅ **Minimap** - Code overview
- ✅ **Code Folding** - Collapse/expand blocks
- ✅ **Bracket Matching** - Colorized brackets
- ✅ **Git Diff** - Compare versions
- ✅ **Themes** - Light, dark, high contrast
- ✅ **Keyboard Shortcuts** - VS Code bindings
- ✅ **Context Menu** - Right-click actions
- ✅ **Hover Info** - Type information
- ✅ **Parameter Hints** - Function signatures

### Custom Features in Our Implementation
- ✅ **Copy to Clipboard**
- ✅ **Download Code**
- ✅ **Language Switcher**
- ✅ **Fullscreen Mode**
- ✅ **Configurable Settings**
- ✅ **Diff Editor**
- ✅ **Dark/Light Mode Sync**
- ✅ **Save/Load**

---

## 🐛 Troubleshooting

### Issue: Workers Not Loading

**Solution**: Make sure you've configured the workers properly. Add to your `main.jsx`:

```typescript
import './monaco-workers';
```

### Issue: TypeScript Errors

**Solution**: Install Monaco types:

```bash
npm install --save-dev @types/monaco-editor
```

### Issue: Large Bundle Size

**Solution**: Monaco is ~3MB. Use code splitting:

```tsx
import { lazy, Suspense } from 'react';

const MonacoEditor = lazy(() => import('~/components/CodeEditor'));

function MyComponent() {
  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      <MonacoEditor />
    </Suspense>
  );
}
```

### Issue: Performance with Large Files

**Solution**: Enable lazy loading of large models:

```tsx
const options = {
  largeFileOptimizations: true,
  maxTokenizationLineLength: 20000,
};

<MonacoEditor options={options} />
```

---

## 📚 Resources

- **Monaco Editor Docs**: https://microsoft.github.io/monaco-editor/
- **Monaco API Reference**: https://microsoft.github.io/monaco-editor/api/
- **VS Code Themes**: https://vscodethemes.com/
- **Language Support**: https://github.com/microsoft/monaco-languages

---

## ✅ Next Steps

1. Install `monaco-editor` package
2. Configure Vite workers
3. Import components where needed
4. Customize themes and settings
5. Add to your routes or dialogs

Your Monaco Editor integration is ready to use! 🎉
