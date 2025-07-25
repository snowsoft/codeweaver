import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import {
  Code2,
  Activity,
  Eye,
  Settings,
  FileText,
  GitBranch,
  Zap,
  Shield,
  TrendingUp,
  Play,
  RefreshCw,
  Menu,
  X,
  Home,
  BarChart3,
  Search
} from 'lucide-react'
import CodeVisualization from './components/CodeVisualization'
import ProjectHealth from './components/ProjectHealth'

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const stats = {
    totalFiles: 45,
    linesOfCode: 12450,
    complexity: 15,
    coverage: 78,
    issues: 8
  }

  const navigation = [
    { id: 'overview', name: 'Genel Bakış', icon: Home },
    { id: 'health', name: 'Proje Sağlığı', icon: Activity },
    { id: 'visualization', name: 'Görselleştirme', icon: Eye },
    { id: 'generator', name: 'Kod Üretici', icon: Zap },
  ]

  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    width: '256px',
    backgroundColor: '#1e293b',
    borderRight: '1px solid #334155',
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 50,
  }

  const sidebarStyleDesktop: React.CSSProperties = {
    ...sidebarStyle,
    position: 'static',
    transform: 'translateX(0)',
    flexShrink: 0,
  }

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    overflow: 'hidden',
  }

  const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  }

  const contentGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '1.5rem',
    '@media (min-width: 1024px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  }

  const OverviewContent = () => (
      <div style={{ padding: '1.5rem', height: '100%', overflow: 'auto' }}>
        {/* Stats Grid */}
        <div style={statsGridStyle}>
          {[
            { label: 'Dosyalar', value: stats.totalFiles, icon: FileText, color: '#3b82f6' },
            { label: 'Kod Satırı', value: stats.linesOfCode.toLocaleString(), icon: Code2, color: '#10b981' },
            { label: 'Karmaşıklık', value: stats.complexity, icon: TrendingUp, color: '#f59e0b' },
            { label: 'Test Kapsamı', value: `${stats.coverage}%`, icon: Shield, color: '#8b5cf6' },
            { label: 'Sorunlar', value: stats.issues, icon: Activity, color: '#ef4444' },
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
                <div
                    key={index}
                    style={{
                      backgroundColor: '#1e293b',
                      borderRadius: '0.5rem',
                      padding: '1rem',
                      border: '1px solid #334155',
                    }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{ width: '32px', height: '32px', color: stat.color }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: '0.875rem',
                        color: '#94a3b8',
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {stat.label}
                      </p>
                      <p style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: stat.color,
                        margin: 0
                      }}>
                        {stat.value}
                      </p>
                    </div>
                  </div>
                </div>
            )
          })}
        </div>

        {/* Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: window.innerWidth >= 1024 ? '1fr 1fr' : '1fr',
          gap: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          {/* Recent Activities */}
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '0.5rem',
            border: '1px solid #334155',
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Activity style={{ width: '20px', height: '20px' }} />
                Son Aktiviteler
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[
                  { text: 'Kod analizi tamamlandı', time: '5 dakika önce', color: '#10b981' },
                  { text: '3 dosya refactor edildi', time: '15 dakika önce', color: '#3b82f6' },
                  { text: '2 güvenlik sorunu tespit edildi', time: '1 saat önce', color: '#f59e0b' },
                ].map((activity, index) => (
                    <div
                        key={index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          backgroundColor: '#0f172a',
                          borderRadius: '0.5rem',
                        }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: activity.color,
                        }} />
                        <div>
                          <p style={{
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            margin: 0,
                            marginBottom: '0.125rem'
                          }}>
                            {activity.text}
                          </p>
                          <p style={{
                            fontSize: '0.75rem',
                            color: '#94a3b8',
                            margin: 0
                          }}>
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>

          {/* Project Metrics */}
          <div style={{
            backgroundColor: '#1e293b',
            borderRadius: '0.5rem',
            border: '1px solid #334155',
          }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155' }}>
              <h3 style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <BarChart3 style={{ width: '20px', height: '20px' }} />
                Proje Metrikleri
              </h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { label: 'Kod Kalitesi', value: 85, color: '#10b981' },
                  { label: 'Güvenlik', value: 92, color: '#3b82f6' },
                  { label: 'Performans', value: 78, color: '#f59e0b' },
                  { label: 'Sürdürülebilirlik', value: 88, color: '#8b5cf6' },
                ].map((metric, index) => (
                    <div key={index}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.5rem'
                      }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                      {metric.label}
                    </span>
                        <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                      {metric.value}%
                    </span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#334155',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div
                            style={{
                              height: '100%',
                              backgroundColor: metric.color,
                              width: `${metric.value}%`,
                              transition: 'width 0.3s ease'
                            }}
                        />
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{
          backgroundColor: '#1e293b',
          borderRadius: '0.5rem',
          border: '1px solid #334155',
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid #334155' }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              margin: 0
            }}>
              Hızlı Eylemler
            </h3>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {[
                { icon: Code2, label: 'Kod Üret', primary: true },
                { icon: RefreshCw, label: 'Refactor' },
                { icon: FileText, label: 'Dokümantasyon' },
                { icon: Shield, label: 'Güvenlik Tarama' },
              ].map((action, index) => {
                const Icon = action.icon
                return (
                    <button
                        key={index}
                        style={{
                          height: '80px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          backgroundColor: action.primary ? '#3b82f6' : 'transparent',
                          border: action.primary ? 'none' : '1px solid #334155',
                          borderRadius: '0.5rem',
                          color: 'white',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          if (!action.primary) {
                            e.currentTarget.style.backgroundColor = '#334155'
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!action.primary) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        }}
                    >
                      <Icon style={{ width: '24px', height: '24px' }} />
                      <span style={{ fontSize: '0.875rem' }}>{action.label}</span>
                    </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
  )

  return (
      <div style={{
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Sidebar - Mobile */}
        {window.innerWidth < 1024 && (
            <div style={sidebarStyle}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderBottom: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Code2 style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>CodeWeaver</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      padding: '0.25rem'
                    }}
                >
                  <X style={{ width: '16px', height: '16px' }} />
                </button>
              </div>

              <nav style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.id}
                            onClick={() => {
                              setActiveTab(item.id)
                              setSidebarOpen(false)
                            }}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              border: 'none',
                              backgroundColor: activeTab === item.id ? '#3b82f6' : 'transparent',
                              color: 'white',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              textAlign: 'left'
                            }}
                        >
                          <Icon style={{ width: '20px', height: '20px' }} />
                          <span style={{ fontWeight: '500' }}>{item.name}</span>
                        </button>
                    )
                  })}
                </div>
              </nav>
            </div>
        )}

        {/* Sidebar - Desktop */}
        {window.innerWidth >= 1024 && (
            <div style={sidebarStyleDesktop}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                borderBottom: '1px solid #334155'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Code2 style={{ width: '32px', height: '32px', color: '#3b82f6' }} />
                  <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>CodeWeaver</span>
                </div>
              </div>

              <nav style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {navigation.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            style={{
                              width: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.75rem',
                              padding: '0.5rem 0.75rem',
                              borderRadius: '0.5rem',
                              border: 'none',
                              backgroundColor: activeTab === item.id ? '#3b82f6' : 'transparent',
                              color: 'white',
                              cursor: 'pointer',
                              transition: 'background-color 0.2s ease',
                              textAlign: 'left'
                            }}
                        >
                          <Icon style={{ width: '20px', height: '20px' }} />
                          <span style={{ fontWeight: '500' }}>{item.name}</span>
                        </button>
                    )
                  })}
                </div>
              </nav>
            </div>
        )}

        {/* Mobile Overlay */}
        {sidebarOpen && window.innerWidth < 1024 && (
            <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 40
                }}
                onClick={() => setSidebarOpen(false)}
            />
        )}

        {/* Main Content */}
        <div style={mainContentStyle}>
          {/* Mobile Header */}
          {window.innerWidth < 1024 && (
              <header style={{
                backgroundColor: '#1e293b',
                borderBottom: '1px solid #334155',
                padding: '0.75rem 1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <button
                      onClick={() => setSidebarOpen(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                  >
                    <Menu style={{ width: '20px', height: '20px' }} />
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Code2 style={{ width: '24px', height: '24px', color: '#3b82f6' }} />
                    <span style={{ fontWeight: 'bold' }}>CodeWeaver</span>
                  </div>

                  <button
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        padding: '0.25rem'
                      }}
                  >
                    <Settings style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              </header>
          )}

          {/* Desktop Header */}
          {window.innerWidth >= 1024 && (
              <header style={{
                backgroundColor: '#1e293b',
                borderBottom: '1px solid #334155',
                padding: '1rem 1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                      {navigation.find(nav => nav.id === activeTab)?.name || 'CodeWeaver'}
                    </h1>
                    <span style={{
                      backgroundColor: '#334155',
                      color: '#94a3b8',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem'
                    }}>
                  Desktop v2.0
                </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <button style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #334155',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <RefreshCw style={{ width: '16px', height: '16px' }} />
                      Yenile
                    </button>
                    <button style={{
                      backgroundColor: '#3b82f6',
                      border: 'none',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <Play style={{ width: '16px', height: '16px' }} />
                      Analiz Başlat
                    </button>
                  </div>
                </div>
              </header>
          )}

          {/* Main Content Area */}
          <main style={{ flex: 1, overflow: 'auto' }}>
            {activeTab === 'overview' && <OverviewContent />}
            {activeTab === 'health' && <ProjectHealth />}
            {activeTab === 'visualization' && <CodeVisualization />}
            {activeTab === 'generator' && (
                <div style={{ padding: '1.5rem' }}>
                  <div style={{
                    backgroundColor: '#1e293b',
                    borderRadius: '0.5rem',
                    border: '1px solid #334155',
                    padding: '3rem',
                    textAlign: 'center'
                  }}>
                    <Zap style={{
                      width: '64px',
                      height: '64px',
                      color: '#f59e0b',
                      margin: '0 auto 1rem auto'
                    }} />
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                      Kod Üretici Yakında
                    </h3>
                    <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
                      AI destekli kod üretici özelliği geliştirilme aşamasında
                    </p>
                    <button style={{
                      backgroundColor: 'transparent',
                      border: '1px solid #334155',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}>
                      Bilgilendirme Al
                    </button>
                  </div>
                </div>
            )}
          </main>
        </div>
      </div>
  )
}

export default App