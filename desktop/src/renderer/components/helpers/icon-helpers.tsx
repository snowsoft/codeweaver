import {
    AlertTriangle,
    XCircle,
    Info,
    CheckCircle,
    Bug,
    FileText,
    Zap,
    Shield
} from "lucide-react"

export function getSeverityIcon(severity: string) {
    switch (severity.toLowerCase()) {
        case 'error':
        case 'high':
            return <XCircle className="h-4 w-4 text-red-500" />
        case 'warning':
        case 'medium':
            return <AlertTriangle className="h-4 w-4 text-yellow-500" />
        case 'info':
        case 'low':
            return <Info className="h-4 w-4 text-blue-500" />
        case 'success':
            return <CheckCircle className="h-4 w-4 text-green-500" />
        default:
            return <Info className="h-4 w-4 text-gray-500" />
    }
}

export function getTypeIcon(type: string) {
    switch (type.toLowerCase()) {
        case 'bug':
        case 'error':
            return <Bug className="h-4 w-4 text-red-500" />
        case 'documentation':
        case 'docs':
            return <FileText className="h-4 w-4 text-blue-500" />
        case 'performance':
        case 'perf':
            return <Zap className="h-4 w-4 text-yellow-500" />
        case 'security':
        case 'vulnerability':
            return <Shield className="h-4 w-4 text-red-600" />
        default:
            return <FileText className="h-4 w-4 text-gray-500" />
    }
}