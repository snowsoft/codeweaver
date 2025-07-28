# CodeWeaver

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go)](https://go.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-orange?style=for-the-badge)](https://ollama.ai/)


## 🌟 Özellikler

- 🌐 **Dil Bağımsız**: Python, JavaScript, Go, Rust, PHP, Java ve daha fazlası
- 🧠 **Bağlam Farkında**: Proje yapısını anlayarak tutarlı kod üretir
- 🛡️ **Güvenli**: Tüm değişiklikler onayınız olmadan uygulanmaz
- 🎨 **İnteraktif**: Renkli diff görünümü ve düzenleme seçenekleri
- 🔧 **Modüler**: Kolayca genişletilebilir komut yapısı
- 📦 **Template Sistemi**: Hazır proje şablonları ile hızlı başlangıç
- 🤖 **Proaktif Asistan**: Daemon modu ile sürekli kod kalitesi önerileri
- 🔮 **Etki Analizi**: Değişikliklerin etkisini önceden görme
- 🏥 **Otomatik İyileştirme**: Proje sorunlarını tespit ve düzeltme
- 💬 **Doğal Dil Desteği**: Kod tabanını doğal dilde sorgulama
- 🚀 **Hızlı**: Go ile yazılmış, tek binary olarak dağıtılır

## 📋 İçindekiler

- [Kurulum](#kurulum)
- [Hızlı Başlangıç](#hızlı-başlangıç)
- [Komutlar](#komutlar)
- [Template Sistemi](#template-sistemi)
- [Konfigürasyon](#konfigürasyon)
- [Örnekler](#örnekler)
- [Sorun Giderme](#sorun-giderme)

## 🔧 Kurulum

### Gereksinimler

- Go 1.21 veya üzeri
- [Ollama](https://ollama.ai/) (AI model çalıştırma için)

### Docker ile Kurulum

```bash
# Docker Compose ile
docker-compose up -d

# veya Docker ile
docker run --rm -it ghcr.io/snowsoft/codeweaver:latest --help
```

### İkili Dosya İndirme

```bash
# Latest release'i indir
wget https://github.com/snowsoft/codeweaver/releases/latest/download/weaver-$(uname -s)-$(uname -m)
chmod +x weaver-*
sudo mv weaver-* /usr/local/bin/weaver
```

### Go ile Kurulum

```bash
go install github.com/snowsoft/codeweaver@latest
```

### Kaynak Koddan Kurulum

```bash
# Projeyi klonla
git clone https://github.com/snowsoft/codeweaver.git
cd codeweaver

# Kurulum script'ini çalıştır
chmod +x install.sh
./install.sh
```

## 🚀 Hızlı Başlangıç

### 1. Ollama Kurulumu

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Ollama'yı başlat
ollama serve

# Önerilen modeli indir
ollama pull codellama:13b-instruct
```

### 2. İlk Kullanım

```bash
# Kurulumu doğrula
weaver --version

# Yardım
weaver --help

# İlk kodunuzu üretin!
weaver new hello.py --task "Create a simple Flask API with hello world endpoint"
```

## 📖 Komutlar

### Temel Komutlar

#### 🆕 `weaver new` - Yeni Kod Üretme

Sıfırdan yeni kod dosyaları oluşturur.

```bash
weaver new <dosya_adı> --task <açıklama> [--context-file <referans_dosya>]
```

**Örnekler:**
```bash
# Python servis oluştur
weaver new user_service.py --task "Create user service with CRUD operations"

# React component oluştur
weaver new Button.tsx --task "Create reusable button component" --context-file theme.ts

# Go API handler oluştur
weaver new handler.go --task "Create REST API handler for products"
```

### 🔄 `weaver refactor` - Kod İyileştirme

Mevcut kodu modernize eder ve iyileştirir.

```bash
weaver refactor <dosya_adı> --task <açıklama> [--context-dir <proje_dizini>]
```

**Örnekler:**
```bash
# Modern JavaScript syntax'e dönüştür
weaver refactor old_code.js --task "Add TypeScript types and modern syntax"

# Async/await desteği ekle
weaver refactor api.py --task "Add async/await support" --context-dir src/

# Error handling ekle
weaver refactor service.go --task "Add comprehensive error handling"
```

### 📝 `weaver document` - Dokümantasyon

Kod dosyalarına otomatik dokümantasyon ekler.

```bash
weaver document <dosya_adı> [--style <stil>]
```

**Desteklenen Stiller:**
- `jsdoc` - JavaScript için
- `google` - Python için
- `godoc` - Go için (otomatik)
- `phpdoc` - PHP için

**Örnekler:**
```bash
weaver document utils.js --style jsdoc
weaver document helpers.py --style google
weaver document main.go
```

### 🧪 `weaver test` - Test Üretme

Kod için otomatik test dosyaları oluşturur.

```bash
weaver test <dosya_adı> [--framework <test_framework>]
```

**Örnekler:**
```bash
weaver test calculator.py --framework pytest
weaver test api.js --framework jest
weaver test service.go
```

### 🔍 `weaver review` - Kod İnceleme

Güvenlik, performans ve kalite açısından kod analizi yapar.

```bash
weaver review <dosya_adı> [--task <odak_noktası>]
```

**Örnekler:**
```bash
weaver review auth.php --task "Check for security vulnerabilities"
weaver review algorithm.py --task "Analyze time complexity"
```

### Gelişmiş Komutlar

#### 🏥 `weaver heal-project` - Proje Doktoru

Tüm kod tabanını analiz ederek sorunları tespit eder ve otomatik iyileştirme planı sunar.

```bash
weaver heal-project [--auto-fix] [--severity <level>]
```

#### 📦 `weaver add-dependency` - Akıllı Bağımlılık Yönetimi

Sadece paket yüklemez, projeye tam entegre eder.

```bash
weaver add-dependency <package> [--integrate] [--example]
```

#### 🏛️ `weaver check-architecture` - Mimari Uyum Kontrolü

Proje mimarisinin kurallara uygunluğunu kontrol eder.

```bash
weaver check-architecture
```

#### 👁️ `weaver --daemon` - Arka Plan Asistanı

Sürekli çalışan, proaktif önerilerde bulunan asistan modu.

```bash
weaver --daemon start|stop|status
```

#### 💬 `weaver ask` - Doğal Dilde Kod Sorgulama

Kod tabanınızı doğal dilde sorgulayın.

```bash
weaver ask "<soru>"
```

#### 📊 `weaver analyze-impact` - Değişiklik Etki Analizi

Büyük değişikliklerin etkisini önceden görün.

```bash
weaver analyze-impact "<değişiklik senaryosu>"
```

#### 📅 `weaver plan-feature` - Özellik Planlama

Yeni özellikler için otomatik görev listesi ve yol haritası oluşturur.

```bash
weaver plan-feature "<özellik açıklaması>" [--estimate]
```

Detaylı bilgi için [Gelişmiş Komutlar Wiki'sine](https://github.com/snowsoft/codeweaver/wiki/Advanced-Commands) bakın.

## 📦 Template Sistemi

CodeWeaver, hazır proje şablonları ile hızlı proje başlatmanızı sağlar.

### Template Komutları

```bash
# Mevcut template'leri listele
weaver template list

# Template kullanarak proje oluştur
weaver template use <template-adı> <proje-adı>

# Kendi template'ini kaydet
weaver template save <template-adı> <proje-dizini>

# Template detaylarını gör
weaver template info <template-adı>
```

### Mevcut Template'ler

#### 🐘 Laravel Template'leri

1. **`laravel`** - Full-Stack Laravel Uygulaması
   - Web + API routes
   - Sanctum authentication
   - Docker setup (nginx, mysql, redis)
   - User management sistemi
   - Migration dosyaları
   - Frontend desteği

2. **`laravel-api`** - API-Only Laravel
   - Versioned API routes
   - RESTful endpoints
   - Health check endpoint
   - Post/Comment modelleri
   - CORS yapılandırması

3. **`laravel-livewire`** - Laravel + Livewire
   - Livewire 3 entegrasyonu
   - Tailwind CSS
   - Reactive UI components
   - Vite asset bundling

#### ⚛️ React Template'leri

1. **`react-app`** - Modern React Uygulaması
   - Vite + React 18
   - TypeScript desteği
   - React Router
   - Tailwind CSS
   - ESLint + Prettier

2. **`react-component`** - React Component Library
   - Component development setup
   - Storybook entegrasyonu
   - Jest + Testing Library
   - Rollup bundling

#### 🐍 Python Template'leri

1. **`python-cli`** - Python CLI Uygulaması
   - Click framework
   - Poetry dependency management
   - Pytest test setup
   - Type hints

2. **`python-api`** - FastAPI Uygulaması
   - FastAPI + Uvicorn
   - SQLAlchemy ORM
   - Alembic migrations
   - JWT authentication

#### 🚀 Go Template'leri

1. **`go-api`** - Go REST API
   - Gin framework
   - GORM ORM
   - JWT middleware
   - Docker ready

2. **`go-cli`** - Go CLI Uygulaması
   - Cobra framework
   - Configuration management
   - Cross-platform build

### Template Kullanım Örnekleri

```bash
# Laravel blog uygulaması
weaver template use laravel my-blog

# React dashboard
weaver template use react-app admin-dashboard

# Python CLI tool
weaver template use python-cli data-processor

# Go microservice
weaver template use go-api user-service
```

### Özel Template Oluşturma

Kendi template'lerinizi oluşturabilir ve kaydedebilirsiniz:

```bash
# Mevcut projeyi template olarak kaydet
weaver template save my-custom-app ./my-project

# Template'i düzenle
weaver template edit my-custom-app

# Template'i dışa aktar
weaver template export my-custom-app ./template.zip
```

## ⚙️ Konfigürasyon

Konfigürasyon dosyası: `~/.config/weaver/config.yaml`

```yaml
# Ollama API Ayarları
ollama:
  api_url: "http://localhost:11434"
  model: "codellama:13b-instruct"
  temperature: 0.7
  timeout: 120s

# UI Ayarları
ui:
  theme: "dark"
  show_spinner: true
  diff_colors:
    added: "green"
    removed: "red"
    modified: "yellow"

# Template Ayarları
templates:
  source: "local"  # local, remote, both
  remote_url: "https://templates.codeweaver.dev"
  cache_dir: "~/.config/weaver/templates"
  auto_update: true

# Varsayılan Ayarlar
defaults:
  context_depth: 3
  auto_backup: true
  backup_dir: ".weaver_backups"

# Dil-spesifik Ayarlar
languages:
  python:
    test_framework: "pytest"
    doc_style: "google"
  javascript:
    test_framework: "jest"
    doc_style: "jsdoc"
  go:
    test_framework: "native"
    doc_style: "godoc"
```

## 📚 Gelişmiş Örnekler

### 🏗️ Mikroservis Mimarisi Oluşturma

```bash
# User service
weaver template use go-api services/user-service

# Product service
weaver template use python-api services/product-service

# Gateway
weaver template use laravel-api services/api-gateway

# Frontend
weaver template use react-app frontend
```

### 🔄 Toplu Refactoring

```bash
# Tüm JavaScript dosyalarını TypeScript'e dönüştür
find . -name "*.js" -exec weaver refactor {} --task "Convert to TypeScript" \;

# Tüm Python dosyalarına type hints ekle
find . -name "*.py" -exec weaver refactor {} --task "Add type hints" \;
```

### 📖 Proje Genelinde Dokümantasyon

```bash
# Bash script ile
for file in src/**/*.js; do
  weaver document "$file" --style jsdoc
done

# PowerShell ile
Get-ChildItem -Path src -Filter *.py -Recurse | ForEach-Object {
  weaver document $_.FullName --style google
}
```

### 🔧 CI/CD Entegrasyonu

**.github/workflows/code-review.yml:**
```yaml
name: AI Code Review
on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Weaver
        run: |
          wget https://github.com/snowsoft/codeweaver/releases/latest/download/weaver-linux-amd64
          chmod +x weaver-linux-amd64
          sudo mv weaver-linux-amd64 /usr/local/bin/weaver
      
      - name: Run AI Review
        run: |
          weaver review src/ --task "security and performance" > review.md
          cat review.md >> $GITHUB_STEP_SUMMARY
```

## 🐛 Sorun Giderme

### Ollama Bağlantı Sorunları

```bash
# Ollama servisini kontrol et
systemctl status ollama

# Manuel başlat
ollama serve

# API'yi test et
curl http://localhost:11434/api/tags
```

### Model İndirme Sorunları

```bash
# Mevcut modelleri listele
ollama list

# Alternatif model dene
ollama pull codellama:7b

# Model'i konfigürasyonda güncelle
weaver config set ollama.model codellama:7b
```

### Performans İyileştirme

1. Daha küçük model kullan: `codellama:7b`
2. Context derinliğini azalt: `weaver config set defaults.context_depth 2`
3. Timeout süresini artır: `weaver config set ollama.timeout 300s`

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını okuyun.

```bash
# Fork ve clone
git clone https://github.com/YOUR_USERNAME/codeweaver.git
cd codeweaver

# Branch oluştur
git checkout -b feature/amazing-feature

# Değişiklikleri test et
go test ./...

# Commit ve push
git add .
git commit -m "feat: add amazing feature"
git push origin feature/amazing-feature
```

## 📅 Yol Haritası

- [ ] 🌍 Web UI desteği
- [ ] 🔌 VSCode/JetBrains eklentileri
- [ ] 🤖 Otomatik kod tamamlama
- [ ] 📊 Kod metrikleri dashboard
- [ ] 🔄 Git entegrasyonu
- [ ] 🌐 Template marketplace
- [ ] 📦 Plugin sistemi
- [ ] 🎨 Özelleştirilebilir AI promptları

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Ollama](https://ollama.ai/) - Yerel AI model desteği
- [Cobra](https://github.com/spf13/cobra) - CLI framework
- [Anthropic Claude](https://anthropic.com) - AI geliştirme desteği

---

Made with ❤️ by [Snowsoft](https://github.com/snowsoft)