// web/components/AICodeReview.tsx
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  GitPullRequest,
  Play,
  FileCode,
  Shield,
  Zap,
  Bug
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { api } from '@/lib/api';

interface CodeReviewResult {
  summary: {
    score: number;
    issuesCount: number;
    suggestionsCount: number;
  };
  issues: ReviewIssue[];
  suggestions: ReviewSuggestion[];
  security: SecurityIssue[];
  performance: PerformanceIssue[];
}

interface ReviewIssue {
  id: string;
  severity: 'error' | 'warning' | 'info';
  type: string;
  message: string;
  file: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  fix?: {
    range: [number, number];
    text: string;
  };
}

interface ReviewSuggestion {
  id: string;
  type: string;
  message: string;
  code?: string;
  impact: 'high' | 'medium' | 'low';
}

interface SecurityIssue {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: string;
  message: string;
  cwe?: string;
  owasp?: string;
}

interface PerformanceIssue {
  id: string;
  type: string;
  message: string;
  impact: string;
  solution: string;
}

export function AICodeReview({ 
  projectId, 
  branch = 'main' 
}: { 
  projectId: string;
  branch?: string;
}) {
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const startReview = async () => {
    setIsReviewing(true);
    try {
      const response = await api.post('/api/v1/ai/review', {
        projectId,
        branch,
        options: {
          security: true,
          performance: true,
          bestPractices: true,
          accessibility: true
        }
      });
      
      setReviewResult(response.data);
    } catch (error) {
      console.error('Review failed:', error);
    } finally {
      setIsReviewing(false);
    }
  };

  const applyFix = async (issue: ReviewIssue) => {
    if (!issue.fix) return;
    
    try {
      await api.post('/api/v1/projects/apply-fix', {
        projectId,
        file: issue.file,
        fix: issue.fix
      });
      
      // Refresh review
      await startReview();
    } catch (error) {
      console.error('Failed to apply fix:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'error':
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info':
      case 'medium':
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>AI Code Review</CardTitle>
              <p className="text-sm text-muted-foreground">
                Automated code analysis powered by AI
              </p>
            </div>
            
            <Button onClick={startReview} disabled={isReviewing}>
              {isReviewing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Reviewing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Review
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        
        {reviewResult && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${
                  reviewResult.summary.score >= 80 ? 'text-green-500' :
                  reviewResult.summary.score >= 60 ? 'text-yellow-500' :
                  'text-red-500'
                }`}>
                  {reviewResult.summary.score}%
                </div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {reviewResult.summary.issuesCount}
                </div>
                <p className="text-sm text-muted-foreground">Issues Found</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {reviewResult.summary.suggestionsCount}
                </div>
                <p className="text-sm text-muted-foreground">Suggestions</p>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-green-500">
                  {reviewResult.issues.filter(i => i.fix).length}
                </div>
                <p className="text-sm text-muted-foreground">Auto-fixable</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Results */}
      {reviewResult && (
        <Card>
          <CardContent className="p-0">
            <Tabs defaultValue="issues">
              <TabsList className="w-full justify-start rounded-none border-b">
                <TabsTrigger value="issues">
                  <Bug className="h-4 w-4 mr-2" />
                  Issues ({reviewResult.issues.length})
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Shield className="h-4 w-4 mr-2" />
                  Security ({reviewResult.security.length})
                </TabsTrigger>
                <TabsTrigger value="performance">
                  <Zap className="h-4 w-4 mr-2" />
                  Performance ({reviewResult.performance.length})
                </TabsTrigger>
                <TabsTrigger value="suggestions">
                  <Info className="h-4 w-4 mr-2" />
                  Suggestions ({reviewResult.suggestions.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="issues" className="p-4">
                <div className="space-y-3">
                  {reviewResult.issues.map((issue) => (
                    <Alert key={issue.id}>
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(issue.severity)}
                        <div className="flex-1">
                          <AlertDescription>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{issue.message}</span>
                              <Badge variant="secondary" className="text-xs">
                                {issue.type}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {issue.file}:{issue.line}:{issue.column}
                            </p>
                          </AlertDescription>
                        </div>
                        {issue.fix && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => applyFix(issue)}
                          >
                            Apply Fix
                          </Button>
                        )}
                      </div>
                    </Alert>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="security" className="p-4">
                <div className="space-y-3">
                  {reviewResult.security.map((issue) => (
                    <Alert key={issue.id} variant="destructive">
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{issue.message}</span>
                          {issue.cwe && (
                            <Badge variant="destructive" className="text-xs">
                              CWE-{issue.cwe}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs">Type: {issue.type}</p>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="performance" className="p-4">
                <div className="space-y-3">
                  {reviewResult.performance.map((issue) => (
                    <Alert key={issue.id}>
                      <Zap className="h-4 w-4" />
                      <AlertDescription>
                        <div className="mb-2">
                          <p className="font-medium">{issue.message}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            Impact: {issue.impact}
                          </p>
                        </div>
                        <div className="p-2 bg-muted rounded text-sm">
                          <p className="font-medium mb-1">Solution:</p>
                          <p>{issue.solution}</p>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions" className="p-4">
                <div className="space-y-3">
                  {reviewResult.suggestions.map((suggestion) => (
                    <Card key={suggestion.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium">{suggestion.message}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="secondary">
                                {suggestion.type}
                              </Badge>
                              <Badge variant={
                                suggestion.impact === 'high' ? 'destructive' :
                                suggestion.impact === 'medium' ? 'default' :
                                'secondary'
                              }>
                                {suggestion.impact} impact
                              </Badge>
                            </div>
                            {suggestion.code && (
                              <div className="mt-3">
                                <SyntaxHighlighter
                                  language="javascript"
                                  style={vscDarkPlus}
                                  className="text-sm"
                                >
                                  {suggestion.code}
                                </SyntaxHighlighter>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}