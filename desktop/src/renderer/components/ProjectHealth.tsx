// desktop/src/renderer/components/ProjectHealth.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Play,
  RefreshCw,
  Download,
  Shield,
  Zap,
  Code,
  GitBranch,
  Package
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface HealthIssue {
  id: string;
  type: 'security' | 'performance' | 'quality' | 'dependency';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  file?: string;
  line?: number;
  fixCommand?: string;
  autoFixable: boolean;
}

interface HealthReport {
  score: number;
  issues: HealthIssue[];
  metrics: {
    testCoverage: number;
    codeComplexity: number;
    technicalDebt: number;
    dependencyHealth: number;
  };
  lastAnalysis: Date;
}

export function ProjectHealth({ projectPath }: { projectPath: string | null }) {
  const [report, setReport] = useState<HealthReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const { toast } = useToast();

  const analyzeProject = async () => {
    if (!projectPath) {
      toast({
        title: "No project selected",
        description: "Please open a project first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await window.api.weaver.execute('heal-project', [
        projectPath,
        '--json'
      ]);
      
      const reportData = JSON.parse(result);
      setReport(reportData);
      
      toast({
        title: "Analysis Complete",
        description: `Found ${reportData.issues.length} issues`,
      });
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const fixSelectedIssues = async () => {
    const issuesToFix = report?.issues.filter(issue => 
      selectedIssues.includes(issue.id) && issue.autoFixable
    ) || [];

    for (const issue of issuesToFix) {
      if (issue.fixCommand) {
        try {
          await window.api.weaver.execute(...issue.fixCommand.split(' '));
          toast({
            title: "Fixed",
            description: issue.title,
          });
        } catch (error) {
          toast({
            title: "Fix Failed",
            description: `${issue.title}: ${error.message}`,
            variant: "destructive"
          });
        }
      }
    }

    // Re-analyze after fixes
    await analyzeProject();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium': return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'quality': return <Code className="h-4 w-4" />;
      case 'dependency': return <Package className="h-4 w-4" />;
    }
  };

  if (!projectPath) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <GitBranch className="h-12 w-12 mx-auto mb-4" />
          <p>No project selected</p>
          <p className="text-sm mt-2">Open a project to analyze its health</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Project Health</h2>
          <p className="text-muted-foreground">{projectPath}</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            onClick={analyzeProject}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Analyze
              </>
            )}
          </Button>
          
          {report && (
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {report && (
        <>
          {/* Health Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Health Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className={`text-5xl font-bold ${getScoreColor(report.score)}`}>
                  {report.score}%
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  Last analysis: {new Date(report.lastAnalysis).toLocaleString()}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Test Coverage</p>
                  <Progress value={report.metrics.testCoverage} className="mt-2" />
                  <p className="text-sm font-medium mt-1">{report.metrics.testCoverage}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Code Quality</p>
                  <Progress value={100 - report.metrics.codeComplexity} className="mt-2" />
                  <p className="text-sm font-medium mt-1">{100 - report.metrics.codeComplexity}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Tech Debt</p>
                  <Progress value={100 - report.metrics.technicalDebt} className="mt-2" />
                  <p className="text-sm font-medium mt-1">{100 - report.metrics.technicalDebt}%</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Dependencies</p>
                  <Progress value={report.metrics.dependencyHealth} className="mt-2" />
                  <p className="text-sm font-medium mt-1">{report.metrics.dependencyHealth}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Issues */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Issues ({report.issues.length})</CardTitle>
                {selectedIssues.length > 0 && (
                  <Button onClick={fixSelectedIssues} size="sm">
                    Fix Selected ({selectedIssues.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all">
                <TabsList className="w-full justify-start rounded-none border-b">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="dependency">Dependencies</TabsTrigger>
                </TabsList>
                
                <ScrollArea className="h-[400px]">
                  <TabsContent value="all" className="mt-0">
                    <IssueList 
                      issues={report.issues}
                      selectedIssues={selectedIssues}
                      onSelectionChange={setSelectedIssues}
                    />
                  </TabsContent>
                  
                  <TabsContent value="security" className="mt-0">
                    <IssueList 
                      issues={report.issues.filter(i => i.type === 'security')}
                      selectedIssues={selectedIssues}
                      onSelectionChange={setSelectedIssues}
                    />
                  </TabsContent>
                  
                  <TabsContent value="performance" className="mt-0">
                    <IssueList 
                      issues={report.issues.filter(i => i.type === 'performance')}
                      selectedIssues={selectedIssues}
                      onSelectionChange={setSelectedIssues}
                    />
                  </TabsContent>
                  
                  <TabsContent value="quality" className="mt-0">
                    <IssueList 
                      issues={report.issues.filter(i => i.type === 'quality')}
                      selectedIssues={selectedIssues}
                      onSelectionChange={setSelectedIssues}
                    />
                  </TabsContent>
                  
                  <TabsContent value="dependency" className="mt-0">
                    <IssueList 
                      issues={report.issues.filter(i => i.type === 'dependency')}
                      selectedIssues={selectedIssues}
                      onSelectionChange={setSelectedIssues}
                    />
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

// Issue List Component
function IssueList({ 
  issues, 
  selectedIssues, 
  onSelectionChange 
}: {
  issues: HealthIssue[];
  selectedIssues: string[];
  onSelectionChange: (selected: string[]) => void;
}) {
  const toggleIssue = (issueId: string) => {
    if (selectedIssues.includes(issueId)) {
      onSelectionChange(selectedIssues.filter(id => id !== issueId));
    } else {
      onSelectionChange([...selectedIssues, issueId]);
    }
  };

  if (issues.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
        <p>No issues found in this category!</p>
      </div>
    );
  }

  return (
    <div className="divide-y">
      {issues.map((issue) => (
        <div
          key={issue.id}
          className="p-4 hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-start gap-3">
            {issue.autoFixable && (
              <input
                type="checkbox"
                checked={selectedIssues.includes(issue.id)}
                onChange={() => toggleIssue(issue.id)}
                className="mt-1"
              />
            )}
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getSeverityIcon(issue.severity)}
                {getTypeIcon(issue.type)}
                <span className="font-medium">{issue.title}</span>
                {issue.autoFixable && (
                  <Badge variant="secondary" className="text-xs">
                    Auto-fixable
                  </Badge>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-2">
                {issue.description}
              </p>
              
              {issue.file && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{issue.file}{issue.line && `:${issue.line}`}</span>
                  {issue.fixCommand && (
                    <code className="px-2 py-1 bg-muted rounded">
                      {issue.fixCommand}
                    </code>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
