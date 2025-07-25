// plugins/react-advanced/src/extension.ts
import { PluginContext, CodeWeaverPluginAPI } from '@codeweaver/plugin-sdk';

export function activate(context: PluginContext) {
  console.log('React Advanced Tools plugin activated');

  const api = context.api;

  // Register create component command
  context.subscriptions.push(
    api.registerCommand('react-advanced.createComponent', async () => {
      const name = await api.showInputBox({
        prompt: 'Component name:',
        placeHolder: 'MyComponent'
      });

      if (!name) return;

      const type = await api.showQuickPick([
        'Functional Component',
        'Class Component',
        'Custom Hook'
      ], {
        placeHolder: 'Select component type'
      });

      // Generate component using AI
      const result = await api.generateCode({
        task: `Create a ${type} called ${name} with TypeScript, tests, and Storybook stories`,
        context: {
          framework: 'react',
          language: 'typescript',
          testing: 'jest',
          styling: 'styled-components'
        }
      });

      // Create files
      await api.writeFile(`src/components/${name}/${name}.tsx`, result.component);
      await api.writeFile(`src/components/${name}/${name}.test.tsx`, result.test);
      await api.writeFile(`src/components/${name}/${name}.stories.tsx`, result.stories);
      await api.writeFile(`src/components/${name}/index.ts`, `export * from './${name}';`);

      api.showInformationMessage(`Component ${name} created successfully!`);
    })
  );

  // Register convert to hooks command
  context.subscriptions.push(
    api.registerCommand('react-advanced.convertToHooks', async () => {
      const editor = api.getActiveTextEditor();
      if (!editor) {
        api.showErrorMessage('No active editor');
        return;
      }

      const code = editor.document.getText();
      
      // Use AI to convert class component to hooks
      const result = await api.refactorCode({
        code,
        task: 'Convert this React class component to a functional component with hooks',
        preserveLogic: true
      });

      // Show diff and apply changes
      const action = await api.showInformationMessage(
        'Convert to hooks?',
        'Yes',
        'Preview',
        'Cancel'
      );

      if (action === 'Yes') {
        await editor.edit(editBuilder => {
          const fullRange = new Range(
            editor.document.positionAt(0),
            editor.document.positionAt(code.length)
          );
          editBuilder.replace(fullRange, result.refactoredCode);
        });
      } else if (action === 'Preview') {
        // Show diff in webview
        const panel = api.createWebviewPanel(
          'react-diff',
          'Convert to Hooks Preview',
          { enableScripts: true }
        );
        
        panel.webview.html = createDiffHtml(code, result.refactoredCode);
      }
    })
  );

  // Register custom AI prompt for React optimization
  context.subscriptions.push(
    api.registerAIPrompt({
      id: 'react-optimization',
      name: 'Optimize React Component',
      description: 'Analyze and optimize React component performance',
      prompt: `Analyze the following React component and provide optimization suggestions:

1. Identify unnecessary re-renders
2. Suggest React.memo usage
3. Find opportunities for useMemo and useCallback
4. Detect potential memory leaks
5. Recommend code splitting opportunities
6. Suggest lazy loading strategies

Component code:
{{code}}

Provide specific code examples for each optimization.`,
      context: ['activeFile', 'projectType'],
      parameters: [
        {
          name: 'includeTests',
          type: 'boolean',
          default: true,
          description: 'Include test updates'
        }
      ]
    })
  );

  // Add React-specific templates
  context.subscriptions.push(
    api.registerTemplate({
      id: 'react-context',
      name: 'React Context Provider',
      description: 'Create a typed React Context with provider and hook',
      category: 'React',
      files: [
        {
          path: '{{name}}Context.tsx',
          content: `import React, { createContext, useContext, useState, ReactNode } from 'react';

interface {{Name}}ContextType {
  // Add your context properties here
  value: string;
  setValue: (value: string) => void;
}

const {{Name}}Context = createContext<{{Name}}ContextType | undefined>(undefined);

export function {{Name}}Provider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('');

  return (
    <{{Name}}Context.Provider value={{ value, setValue }}>
      {children}
    </{{Name}}Context.Provider>
  );
}

export function use{{Name}}() {
  const context = useContext({{Name}}Context);
  if (context === undefined) {
    throw new Error('use{{Name}} must be used within a {{Name}}Provider');
  }
  return context;
}`
        }
      ],
      variables: [
        {
          name: 'name',
          description: 'Context name (e.g., "Theme", "Auth")',
          default: 'MyContext'
        }
      ]
    })
  );

  // React-specific code actions
  api.registerCodeActionProvider('typescriptreact', {
    provideCodeActions(document, range, context) {
      const actions = [];
      
      // Add memo to component
      if (isComponentDeclaration(document, range)) {
        actions.push({
          title: 'Wrap with React.memo',
          kind: CodeActionKind.RefactorRewrite,
          command: {
            command: 'react-advanced.wrapWithMemo',
            arguments: [document, range]
          }
        });
      }

      // Extract to custom hook
      if (isHookLogic(document, range)) {
        actions.push({
          title: 'Extract to custom hook',
          kind: CodeActionKind.RefactorExtract,
          command: {
            command: 'react-advanced.extractHook',
            arguments: [document, range]
          }
        });
      }

      return actions;
    }
  });
}

export function deactivate() {
  console.log('React Advanced Tools plugin deactivated');
}

// Helper functions
function createDiffHtml(original: string, refactored: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/diff2html/3.4.0/diff2html.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/diff2html/3.4.0/diff2html.min.js"></script>
</head>
<body>
  <div id="diff"></div>
  <script>
    const diff = Diff2Html.parse(unifiedDiff);
    const html = Diff2Html.html(diff, {
      drawFileList: false,
      matching: 'lines',
      outputFormat: 'side-by-side'
    });
    document.getElementById('diff').innerHTML = html;
  </script>
</body>
</html>`;
}
