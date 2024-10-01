import React, { useRef, useEffect } from 'react';
import * as monaco from 'monaco-editor';

interface MonacoEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  theme: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({ language, value, onChange, theme }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorInstanceRef.current = monaco.editor.create(editorRef.current, {
        value,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: true },
        folding: true,
        foldingStrategy: 'auto',
      });

      editorInstanceRef.current.onDidChangeModelContent(() => {
        onChange(editorInstanceRef.current?.getValue() || '');
      });
    }

    return () => {
      editorInstanceRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorInstanceRef.current) {
      const model = editorInstanceRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  useEffect(() => {
    if (editorInstanceRef.current && value !== editorInstanceRef.current.getValue()) {
      editorInstanceRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    monaco.editor.setTheme(theme);
  }, [theme]);

  return <div ref={editorRef} style={{ width: '100%', height: '100%' }} />;
};

export default MonacoEditor;