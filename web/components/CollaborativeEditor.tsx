// web/components/CollaborativeEditor.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Save, Share2, MessageSquare } from 'lucide-react';
import * as Y from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { MonacoBinding } from 'y-monaco';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  cursor?: {
    line: number;
    column: number;
  };
}

interface CollaborativeEditorProps {
  fileId: string;
  fileName: string;
  language: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

export function CollaborativeEditor({
  fileId,
  fileName,
  language,
  initialContent = '',
  onSave
}: CollaborativeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const ydocRef = useRef<Y.Doc | null>(null);
  const providerRef = useRef<WebrtcProvider | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);

  const { sendMessage, lastMessage } = useWebSocket(`/api/v1/ws/editor/${fileId}`);

  useEffect(() => {
    // Initialize Yjs
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // Create WebRTC provider
    const provider = new WebrtcProvider(`codeweaver-${fileId}`, ydoc, {
      signaling: ['wss://api.codeweaver.dev/signal']
    });
    providerRef.current = provider;

    provider.on('synced', (synced: boolean) => {
      setIsConnected(synced);
    });

    // Handle awareness updates (cursor positions, user info)
    provider.awareness.on('change', () => {
      const states = Array.from(provider.awareness.getStates().entries());
      const collabs = states
        .filter(([clientId]) => clientId !== provider.awareness.clientID)
        .map(([clientId, state]) => ({
          id: clientId.toString(),
          name: state.user?.name || 'Anonymous',
          avatar: state.user?.avatar,
          color: state.user?.color || '#' + Math.floor(Math.random()*16777215).toString(16),
          cursor: state.cursor
        }));
      setCollaborators(collabs);
    });

    // Set user info
    provider.awareness.setLocalStateField('user', {
      name: 'Current User', // Get from auth
      color: '#' + Math.floor(Math.random()*16777215).toString(16)
    });

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
      }
      if (providerRef.current) {
        providerRef.current.destroy();
      }
      if (ydocRef.current) {
        ydocRef.current.destroy();
      }
    };
  }, [fileId]);

  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    if (ydocRef.current && providerRef.current) {
      const ytext = ydocRef.current.getText('monaco');
      
      // Initialize content if empty
      if (ytext.length === 0 && initialContent) {
        ytext.insert(0, initialContent);
      }

      // Create Monaco binding
      const binding = new MonacoBinding(
        ytext,
        editor.getModel()!,
        new Set([editor]),
        providerRef.current.awareness
      );
      bindingRef.current = binding;

      // Track cursor position
      editor.onDidChangeCursorPosition((e: any) => {
        providerRef.current?.awareness.setLocalStateField('cursor', {
          line: e.position.lineNumber,
          column: e.position.column
        });
      });
    }
  };

  const handleSave = () => {
    if (editorRef.current && onSave) {
      const content = editorRef.current.getValue();
      onSave(content);
    }
  };

  const renderCollaboratorCursors = () => {
    if (!editorRef.current || !monacoRef.current) return;

    // Clear existing decorations
    const decorations: any[] = [];

    collaborators.forEach((collaborator) => {
      if (collaborator.cursor) {
        const { line, column } = collaborator.cursor;
        
        // Add cursor decoration
        decorations.push({
          range: new monacoRef.current!.Range(line, column, line, column + 1),
          options: {
            className: 'collaborator-cursor',
            hoverMessage: { value: collaborator.name },
            beforeContentClassName: 'collaborator-cursor-before',
            afterContentClassName: 'collaborator-cursor-after',
            overviewRuler: {
              color: collaborator.color,
              position: monacoRef.current!.editor.OverviewRulerLane.Center
            }
          }
        });

        // Add selection decoration if available
        // ... selection logic
      }
    });

    // Apply decorations
    editorRef.current.deltaDecorations([], decorations);
  };

  useEffect(() => {
    renderCollaboratorCursors();
  }, [collaborators]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>{fileName}</CardTitle>
            <Badge variant={isConnected ? 'default' : 'secondary'}>
              {isConnected ? 'Connected' : 'Connecting...'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Collaborators */}
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <div className="flex -space-x-2">
                {collaborators.slice(0, 3).map((collab) => (
                  <Avatar key={collab.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={collab.avatar} />
                    <AvatarFallback style={{ backgroundColor: collab.color }}>
                      {collab.name[0]}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {collaborators.length > 3 && (
                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                    +{collaborators.length - 3}
                  </div>
                )}
              </div>
            </div>
            
            <Button size="sm" variant="outline">
              <MessageSquare className="h-4 w-4" />
            </Button>
            
            <Button size="sm" variant="outline">
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: 'on',
            automaticLayout: true
          }}
        />
      </CardContent>
    </Card>
  );
}
