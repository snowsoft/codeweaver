// web/app/page.tsx
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Code2, 
  Sparkles, 
  HeartHandshake, 
  MessageSquare,
  Terminal,
  FileCode2,
  GitBranch,
  Users,
  Cloud,
  Zap
} from 'lucide-react';

import { Dashboard } from '@/components/Dashboard';
import { ProjectList } from '@/components/ProjectList';
import { CodePlayground } from '@/components/CodePlayground';
import { AIAssistant } from '@/components/AIAssistant';
import { TemplateGallery } from '@/components/TemplateGallery';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <LandingPage />;
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Code2 className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">CodeWeaver</h1>
            <Badge variant="secondary">Cloud</Badge>
          </div>
          
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <GitBranch className="h-4 w-4 mr-2" />
              Sync
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
            <UserMenu user={user} />
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="playground">Playground</TabsTrigger>
            <TabsTrigger value="ai">AI Assistant</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            <Dashboard userId={user.id} />
          </TabsContent>
          
          <TabsContent value="projects" className="mt-6">
            <ProjectList userId={user.id} />
          </TabsContent>
          
          <TabsContent value="playground" className="mt-6">
            <CodePlayground />
          </TabsContent>
          
          <TabsContent value="ai" className="mt-6">
            <AIAssistant />
          </TabsContent>
          
          <TabsContent value="templates" className="mt-6">
            <TemplateGallery />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// web/components/CodePlayground.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Save, Share2, Download, Loader2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { api } from '@/lib/api';

interface PlaygroundFile {
  name: string;
  content: string;
  language: string;
}

export function CodePlayground() {
  const [files, setFiles] = useState<PlaygroundFile[]>([
    { name: 'main.py', content: '# Start coding here\n', language: 'python' }
  ]);
  const [activeFile, setActiveFile] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  
  const { sendMessage, lastMessage } = useWebSocket('/api/v1/ws');
  
  useEffect(() => {
    if (lastMessage) {
      const data = JSON.parse(lastMessage.data);
      if (data.type === 'output') {
        setOutput(prev => prev + data.content);
      }
    }
  }, [lastMessage]);
  
  const handleRun = async () => {
    setIsRunning(true);
    setOutput('');
    
    try {
      const response = await api.post('/api/v1/playground/run', {
        files: files.map(f => ({
          name: f.name,
          content: f.content
        })),
        entrypoint: files[activeFile].name
      });
      
      // Connect to WebSocket for real-time output
      sendMessage({
        type: 'subscribe',
        channel: `execution:${response.data.executionId}`
      });
    } catch (error) {
      console.error('Failed to run code:', error);
      setOutput('Error: Failed to execute code');
    } finally {
      setIsRunning(false);
    }
  };
  
  const handleGenerate = async () => {
    const task = prompt('What would you like to generate?');
    if (!task) return;
    
    try {
      const response = await api.post('/api/v1/ai/generate', {
        task,
        language: files[activeFile].language,
        context: files[activeFile].content
      });
      
      const newContent = response.data.code;
      setFiles(prev => {
        const updated = [...prev];
        updated[activeFile] = {
          ...updated[activeFile],
          content: newContent
        };
        return updated;
      });
    } catch (error) {
      console.error('Failed to generate code:', error);
    }
  };
  
  const handleSave = async () => {
    try {
      const response = await api.post('/api/v1/playground/save', {
        name: prompt('Project name:') || 'Untitled',
        files
      });
      
      alert(`Project saved! ID: ${response.data.projectId}`);
    } catch (error) {
      console.error('Failed to save project:', error);
    }
  };
  
  const loadTemplate = async (templateId: string) => {
    try {
      const response = await api.get(`/api/v1/templates/${templateId}/files`);
      setFiles(response.data.files);
      setActiveFile(0);
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
      {/* Editor Panel */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Code Editor</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={selectedTemplate} onValueChange={(value) => {
                setSelectedTemplate(value);
                if (value !== 'blank') loadTemplate(value);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blank">Blank</SelectItem>
                  <SelectItem value="hello-world">Hello World</SelectItem>
                  <SelectItem value="api-endpoint">API Endpoint</SelectItem>
                  <SelectItem value="data-analysis">Data Analysis</SelectItem>
                </SelectContent>
              </Select>
              
              <Button size="sm" variant="outline" onClick={handleGenerate}>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </Button>
              
              <Button size="sm" variant="outline" onClick={handleSave}>
                <Save className="h-4 w-4" />
              </Button>
              
              <Button size="sm" onClick={handleRun} disabled={isRunning}>
                {isRunning ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <Tabs value={String(activeFile)} onValueChange={(v) => setActiveFile(Number(v))}>
            <TabsList className="w-full justify-start rounded-none border-b">
              {files.map((file, index) => (
                <TabsTrigger key={index} value={String(index)}>
                  {file.name}
                </TabsTrigger>
              ))}
              <Button
                size="sm"
                variant="ghost"
                className="ml-2"
                onClick={() => {
                  const name = prompt('File name:');
                  if (name) {
                    setFiles([...files, {
                      name,
                      content: '',
                      language: name.split('.').pop() || 'plaintext'
                    }]);
                  }
                }}
              >
                +
              </Button>
            </TabsList>
            
            {files.map((file, index) => (
              <TabsContent key={index} value={String(index)} className="h-full mt-0">
                <Editor
                  height="100%"
                  language={file.language}
                  value={file.content}
                  onChange={(value) => {
                    const updated = [...files];
                    updated[index] = { ...file, content: value || '' };
                    setFiles(updated);
                  }}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    wordWrap: 'on'
                  }}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Output Panel */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Output</CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setOutput('')}>
                Clear
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0">
          <div className="h-full bg-black text-green-400 font-mono text-sm p-4 overflow-auto">
            <pre>{output || 'Output will appear here...'}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// web/components/AIAssistant.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Send, 
  Loader2, 
  Code, 
  FileText, 
  Wand2,
  Bug,
  Lightbulb,
  BookOpen,
  Zap
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  actions?: Action[];
}

interface Action {
  type: 'code' | 'command' | 'link';
  label: string;
  data: any;
}

const quickPrompts = [
  { icon: Code, label: 'Generate code', prompt: 'Generate a ' },
  { icon: Bug, label: 'Debug code', prompt: 'Help me debug this: ' },
  { icon: FileText, label: 'Add docs', prompt: 'Add documentation to ' },
  { icon: Wand2, label: 'Refactor', prompt: 'Refactor this code: ' },
  { icon: Lightbulb, label: 'Explain', prompt: 'Explain how this works: ' },
  { icon: Zap, label: 'Optimize', prompt: 'Optimize this for performance: ' }
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await api.post('/api/v1/ai/chat', {
        message: content,
        context: {
          previousMessages: messages.slice(-5).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      });
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.data.content,
        timestamp: new Date(),
        actions: response.data.actions
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAction = async (action: Action) => {
    switch (action.type) {
      case 'code':
        // Copy code to clipboard
        navigator.clipboard.writeText(action.data);
        break;
      case 'command':
        // Execute command
        await api.post('/api/v1/ai/execute', { command: action.data });
        break;
      case 'link':
        // Open link
        window.open(action.data, '_blank');
        break;
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Chat Panel */}
      <Card className="lg:col-span-2 flex flex-col">
        <CardHeader>
          <CardTitle>AI Assistant</CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 p-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">How can I help you today?</h3>
                <p className="text-muted-foreground mb-8">
                  Ask me anything about coding, debugging, or software development.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl">
                  {quickPrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setInput(prompt.prompt)}
                    >
                      <prompt.icon className="h-6 w-6" />
                      <span className="text-sm">{prompt.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {message.role === 'user' ? 'U' : 'AI'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-lg p-4 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <ReactMarkdown
                          components={{
                            code({ node, inline, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '');
                              return !inline && match ? (
                                <SyntaxHighlighter
                                  style={vscDarkPlus}
                                  language={match[1]}
                                  PreTag="div"
                                  {...props}
                                >
                                  {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                              ) : (
                                <code className={className} {...props}>
                                  {children}
                                </code>
                              );
                            }
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                        
                        {message.actions && message.actions.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {message.actions.map((action, index) => (
                              <Button
                                key={index}
                                size="sm"
                                variant="secondary"
                                onClick={() => handleAction(action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </div>
            )}
          </ScrollArea>
          
          <div className="border-t p-4">
            <form onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }} className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(input);
                  }
                }}
                placeholder="Ask me anything..."
                className="resize-none"
                rows={3}
              />
              <Button 
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
      
      {/* Context Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Context</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium mb-2">Active Project</h4>
              <p className="text-sm text-muted-foreground">No project selected</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Recent Files</h4>
              <p className="text-sm text-muted-foreground">No files opened</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Resources</h4>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Documentation
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Code className="h-4 w-4 mr-2" />
                  Examples
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}