import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { ScrollArea } from './ui/scroll-area'
import { Progress } from './ui/progress'
import { getSeverityIcon, getTypeIcon } from './helpers/icon-helpers'
import {
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    TrendingUp,
    TrendingDown,
    Minus,
    Info,
    Shield,
    Zap,
    Code,
    Package,
    GitBranch,
    Play,
    Download
} from 'lucide-react'
import { useToast } from './ui/use-toast'

interface HealthIssue {
    id: string
    type: 'error' | 'warning' | 'info' | 'suggestion'
    severity: 'high' | 'medium' | 'low'
    title: string
    description: string
    file: string
    line?: number
    category: 'security' | 'performance' | 'maintainability' | 'bugs' | 'code-smell'
    fixable: boolean
}

interface ProjectMetrics {
    codeQuality: number
    security: number
    performance: number
    maintainability: number
    coverage: number
    duplication: number
    issues: {
        total: number
        high: number
        medium: number
        low: number
    }
}

interface ProjectHealthData {
    metrics: ProjectMetrics
    issues: HealthIssue[]
    trends: {
        codeQuality: 'up' | 'down' | 'stable'
        security: 'up' | 'down' | 'stable'
        performance: 'up' | 'down' | 'stable'
        maintainability: 'up' | 'down' | 'stable'
    }
    lastScan: string
    scanning: boolean
}

const ProjectHealth: React.FC = () => {
    const [healthData, setHealthData] = useState<ProjectHealthData | null>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<string>('all')
    const { toast } = useToast()

    // Mock data for demonstration
    const mockHealthData: ProjectHealthData = {
        metrics: {
            codeQuality: 85,
            security: 92,
            performance: 78,
            maintainability: 88,
            coverage: 76,
            duplication: 12,
            issues: {
                total: 23,
                high: 3,
                medium: 8,
                low: 12
            }
        },
        issues: [
            {
                id: '1',
                type: 'error',
                severity: 'high',
                title: 'Potansiyel XSS Açığı',
                description: 'Kullanıcı girişi sanitize edilmeden kullanılıyor',
                file: 'src/components/UserInput.tsx',
                line: 42,
                category: 'security',
                fixable: true
            },
            {
                id: '2',
                type: 'warning',
                severity: 'medium',
                title: 'Performans Sorunu',
                description: 'Büyük liste render edilirken pagination kullanılmalı',
                file: 'src/components/DataTable.tsx',
                line: 156,
                category: 'performance',
                fixable: true
            },
            {
                id: '3',
                type: 'info',
                severity: 'low',
                title: 'Code Smell',
                description: 'Uzun fonksiyon refactor edilmeli (45 satır)',
                file: 'src/utils/dataProcessor.ts',
                line: 23,
                category: 'maintainability',
                fixable: false
            }
        ],
        trends: {
            codeQuality: 'up',
            security: 'stable',
            performance: 'down',
            maintainability: 'up'
        },
        lastScan: '2024-01-15T10:30:00Z',
        scanning: false
    }

    useEffect(() => {
        // Simulate loading health data
        loadHealthData()
    }, [])

    const loadHealthData = async () => {
        setIsScanning(true)
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000))
            setHealthData(mockHealthData)
            toast({
                title: "Proje analizi tamamlandı",
                description: "Sağlık raporu başarıyla güncellendi.",
            })
        } catch (error) {
            toast({
                title: "Analiz hatası",
                description: `Proje analizi sırasında hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
                variant: "destructive",
            })
        } finally {
            setIsScanning(false)
        }
    }

    const handleScan = async () => {
        await loadHealthData()
    }

    const fixIssue = async (issueId: string) => {
        try {
            // Simulate fixing issue
            if (healthData) {
                const updatedIssues = healthData.issues.filter(issue => issue.id !== issueId)
                setHealthData({
                    ...healthData,
                    issues: updatedIssues
                })
            }
            toast({
                title: "Sorun düzeltildi",
                description: "Otomatik düzeltme başarıyla uygulandı.",
            })
        } catch (error) {
            toast({
                title: "Düzeltme hatası",
                description: `Sorun düzeltilirken hata oluştu: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
                variant: "destructive",
            })
        }
    }

    const getMetricIcon = (metric: string) => {
        switch (metric) {
            case 'codeQuality': return <Info className="h-4 w-4" />
            case 'security': return <Shield className="h-4 w-4" />
            case 'performance': return <Zap className="h-4 w-4" />
            case 'maintainability': return <Code className="h-4 w-4" />
            case 'coverage': return <Package className="h-4 w-4" />
            default: return <Info className="h-4 w-4" />
        }
    }

    const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
            case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
            case 'stable': return <Minus className="h-4 w-4 text-yellow-500" />
        }
    }

    const getMetricColor = (value: number) => {
        if (value >= 80) return 'text-green-500'
        if (value >= 60) return 'text-yellow-500'
        return 'text-red-500'
    }

    const filteredIssues = healthData?.issues.filter(issue =>
        selectedCategory === 'all' || issue.category === selectedCategory
    ) || []

    if (!healthData && !isScanning) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GitBranch className="h-5 w-5" />
                        Proje Sağlığı
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12">
                    <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Analiz Verisi Bulunamadı</h3>
                    <p className="text-slate-400 mb-6">
                        Proje sağlık analizi için tarama başlatın
                    </p>
                    <Button onClick={handleScan} className="gap-2">
                        <Play className="h-4 w-4" />
                        Analizi Başlat
                    </Button>
                </CardContent>
            </Card>
        )
    }

    if (isScanning) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Proje Analiz Ediliyor...
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Kod Kalitesi Analizi</span>
                            <span>%75</span>
                        </div>
                        <Progress value={75} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Güvenlik Taraması</span>
                            <span>%45</span>
                        </div>
                        <Progress value={45} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Performans Analizi</span>
                            <span>%30</span>
                        </div>
                        <Progress value={30} className="w-full" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Kod Duplikasyonu</span>
                            <span>%10</span>
                        </div>
                        <Progress value={10} className="w-full" />
                    </div>
                    <p className="text-sm text-slate-400 text-center">
                        Analiz birkaç dakika sürebilir...
                    </p>
                </CardContent>
            </Card>
        )
    }

    if (!healthData) {
        return null
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <GitBranch className="h-5 w-5" />
                            Proje Sağlığı
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={handleScan} disabled={isScanning}>
                                {isScanning ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                Yenile
                            </Button>
                            <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-2" />
                                Rapor İndir
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(healthData.metrics).slice(0, 6).map(([key, value], index) => {
                    const isIssues = key === 'issues'
                    const metricValue = isIssues ? (value as any).total : value as number
                    const trend = healthData.trends[key as keyof typeof healthData.trends]

                    return (
                        <Card key={key}>
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getMetricIcon(key)}
                                        <div>
                                            <p className="text-sm font-medium text-slate-400">
                                                {key === 'codeQuality' && 'Kod Kalitesi'}
                                                {key === 'security' && 'Güvenlik'}
                                                {key === 'performance' && 'Performans'}
                                                {key === 'maintainability' && 'Sürdürülebilirlik'}
                                                {key === 'coverage' && 'Test Kapsamı'}
                                                {key === 'duplication' && 'Kod Duplikasyonu'}
                                            </p>
                                            <p className={`text-2xl font-bold ${getMetricColor(metricValue)}`}>
                                                {isIssues ? metricValue : `${metricValue}%`}
                                            </p>
                                        </div>
                                    </div>
                                    {trend && getTrendIcon(trend)}
                                </div>
                                {!isIssues && (
                                    <div className="mt-4">
                                        <Progress value={metricValue} className="w-full" />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Issues Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Tespit Edilen Sorunlar ({healthData.issues.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                        <TabsList className="grid w-full grid-cols-6">
                            <TabsTrigger value="all">Tümü</TabsTrigger>
                            <TabsTrigger value="security">Güvenlik</TabsTrigger>
                            <TabsTrigger value="performance">Performans</TabsTrigger>
                            <TabsTrigger value="bugs">Hatalar</TabsTrigger>
                            <TabsTrigger value="maintainability">Sürdürülebilirlik</TabsTrigger>
                            <TabsTrigger value="code-smell">Code Smell</TabsTrigger>
                        </TabsList>

                        <TabsContent value={selectedCategory} className="mt-4">
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                    {filteredIssues.map((issue) => (
                                        <div
                                            key={issue.id}
                                            className="border border-slate-700 rounded-lg p-4 space-y-3"
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    {getSeverityIcon(issue.severity)}
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{issue.title}</h4>
                                                            <Badge variant={
                                                                issue.severity === 'high' ? 'destructive' :
                                                                    issue.severity === 'medium' ? 'warning' : 'secondary'
                                                            }>
                                                                {issue.severity}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-slate-400">{issue.description}</p>
                                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                                            <span>{issue.file}</span>
                                                            {issue.line && <span>:{issue.line}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {issue.fixable && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => fixIssue(issue.id)}
                                                    >
                                                        Düzelt
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {filteredIssues.length === 0 && (
                                        <div className="text-center py-8">
                                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                                            <p className="text-slate-400">Bu kategoride sorun bulunamadı</p>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

export default ProjectHealth