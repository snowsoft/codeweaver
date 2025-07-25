# 🧵 Code Weaver (Kod Dokuyucu)

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=for-the-badge&logo=go)](https://go.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Ollama](https://img.shields.io/badge/Powered%20by-Ollama-orange?style=for-the-badge)](https://ollama.ai/)

> Evrensel kod üretim ve dönüşüm CLI aracı - Yapay zeka destekli geliştirici asistanınız

Code Weaver, geliştiricilerin kod yazma, refactor etme, belgelendirme ve test süreçlerini otomatize eden güçlü bir komut satırı aracıdır. Herhangi bir programlama dilinde çalışır ve proje bağlamını anlayarak akıllı kod dönüşümleri gerçekleştirir.

## ✨ Özellikler

- 🌐 **Dil Bağımsız**: Python, JavaScript, Go, Rust, PHP, Java ve daha fazlası
- 🧠 **Bağlam Farkında**: Proje yapısını anlayarak tutarlı kod üretir
- 🛡️ **Güvenli**: Tüm değişiklikler onayınız olmadan uygulanmaz
- 🎨 **İnteraktif**: Renkli diff görünümü ve düzenleme seçenekleri
- 🔧 **Modüler**: Kolayca genişletilebilir komut yapısı
- 🚀 **Hızlı**: Go ile yazılmış, tek binary olarak dağıtılır

## 📸 Ekran Görüntüleri

<details>
<summary>🖼️ Kullanım Örnekleri</summary>

### Kod Üretimi
```bash
$ weaver new api_handler.go --task "Create REST API handler for user management"
✓ Code generated successfully!

Generated Code
┌─────────────────────────────────────────────────────────┐
│ package handlers                                        │
│                                                         │
│ import (                                                │
│     "encoding/json"                                     │
│     "net/http"                                         │
│     ...                                                 │
└─────────────────────────────────────────────────────────┘

Save this code to api_handler.go? [Y/n]
```

### Kod Refactoring
```bash
$ weaver refactor legacy.js --task "Modernize to ES6+ syntax"
✓ Code refactored successfully!

Proposed Changes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-  12 | var userData = {};
+  12 | const userData = {};
-  15 | function processData(data) {
+  15 | const processData = (data) => {
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What would you like to do?
> Accept changes
  Decline changes  
  Edit manually
```

</details>

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Go 1.21 veya üzeri
- [Ollama](https://ollama.ai/) (AI model çalıştırma için)

### Kurulum

#### Option 1: Docker (En Kolay)
```bash
# Docker Compose ile
docker-compose up -d

# veya Docker ile
docker run --rm -it ghcr.io/snowsoft/codeweaver:latest --help
```

#### Option 2: Pre-built Binary
```bash
# Latest release'i indir
wget https://github.com/snowsoft/codeweaver/releases/latest/download/weaver-$(uname -s)-$(uname -m)
chmod +x weaver-*
sudo mv weaver-* /usr/local/bin/weaver
```

#### Option 3: Go Install (Önerilen)
```bash
go install github.com/snowsoft/codeweaver@latest
```

#### Option 4: Kaynak Koddan Derleme

**Linux/macOS:**
```bash
# 1. Projeyi klonla
git clone https://github.com/snowsoft/codeweaver.git
cd codeweaver

# 2. Kurulum script'ini çalıştır
chmod +x install.sh
./install.sh
```

**Windows (PowerShell):**
```powershell
# 1. Projeyi klonla
git clone https://github.com/snowsoft/codeweaver.git
cd codeweaver

# 2. PowerShell script'ini çalıştır
powershell -ExecutionPolicy Bypass -File install.ps1
```

**Windows (Command Prompt):**
```batch
# 1. Projeyi klonla
git clone https://github.com/snowsoft/codeweaver.git
cd codeweaver

# 2. Batch script'ini çalıştır
install.bat
```

**Manuel Kurulum:**
```bash
# 1. Projeyi klonla
git clone https://github.com/snowsoft/codeweaver.git
cd codeweaver

# 2. Bağımlılıkları indir
go mod download
go mod tidy

# 3. Derle
go build -o weaver .

# 4. Sisteme kur
# Linux/macOS
sudo mv weaver /usr/local/bin/

# Windows (Administrator olarak)
move weaver.exe C:\Windows\System32\

# 5. Konfigürasyon dosyasını oluştur
mkdir -p ~/.config/weaver
cp config.yaml.example ~/.config/weaver/config.yaml
```

#### Sorun Giderme - Kurulum

**`missing go.sum entry` hatası:**
```bash
# Bağımlılıkları manuel olarak ekleyin
go get github.com/spf13/cobra@v1.8.0
go get github.com/spf13/viper@v1.18.2
go get github.com/pterm/pterm@v0.12.71
go get github.com/sergi/go-diff@v1.3.1
go get github.com/AlecAivazis/survey/v2@v2.3.7
go get gopkg.in/yaml.v3@v3.0.1

# go.sum dosyasını yeniden oluştur
go mod tidy
```

**Windows'ta `GOPROXY` veya `GOSUMDB` hatası:**
```batch
# Go ortam değişkenlerini düzelt
go env -w GOPROXY=https://proxy.golang.org,direct
go env -w GOSUMDB=sum.golang.org
go env -w GO111MODULE=on

# veya fix-goproxy.bat dosyasını çalıştır
fix-goproxy.bat
```

**"package is not in std" hatası (Bozuk Go kurulumu):**
```powershell
# Go ortamını düzelt
powershell -ExecutionPolicy Bypass -File fix-go-env.ps1

# veya manuel olarak
# 1. Go'yu tamamen kaldır
# 2. https://go.dev/dl/ adresinden yeniden indir
# 3. Varsayılan konuma kur (C:\Program Files\Go)
# 4. Bilgisayarı yeniden başlat
```

**Proxy/Firewall arkasındaysanız:**
```batch
# Checksum doğrulamasını kapat
go env -w GOSUMDB=off
go env -w GOPROXY=direct

# Şirket proxy'si varsa
set HTTP_PROXY=http://proxy.company.com:8080
set HTTPS_PROXY=http://proxy.company.com:8080

# Offline kurulum script'ini kullan
powershell -ExecutionPolicy Bypass -File install-offline.ps1
```

#### Option 3: Pre-built Binary İndir
```bash
# Linux (amd64)
wget https://github.com/snowsoft/codeweaver/releases/latest/download/weaver-linux-amd64
chmod +x weaver-linux-amd64
sudo mv weaver-linux-amd64 /usr/local/bin/weaver

# macOS (arm64)
wget https://github.com/snowsoft/codeweaver/releases/latest/download/weaver-darwin-arm64
chmod +x weaver-darwin-arm64
sudo mv weaver-darwin-arm64 /usr/local/bin/weaver

# Windows
# Download weaver-windows-amd64.exe from releases page
```

### Ollama Kurulumu

```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Ollama'yı başlat
ollama serve

# Önerilen modeli indir
ollama pull codellama:13b-instruct
```

### İlk Kullanım

```bash
# Kurulumu doğrula
weaver --version

# Yardım
weaver --help

# İlk kodunuzu üretin!
weaver new hello.py --task "Create a simple Flask API with hello world endpoint"
```

## 📖 Kullanım Kılavuzu

### Komutlar

#### `weaver new` - Yeni Kod Üretme
```bash
weaver new <dosya_adı> --task <açıklama> [--context-file <referans_dosya>]

# Örnekler
weaver new user_service.py --task "Create user service with CRUD operations"
weaver new Button.tsx --task "Create reusable button component" --context-file theme.ts
```

#### `weaver refactor` - Kod İyileştirme
```bash
weaver refactor <dosya_adı> --task <açıklama> [--context-dir <proje_dizini>]

# Örnekler
weaver refactor old_code.js --task "Add TypeScript types and modern syntax"
weaver refactor api.py --task "Add async/await support" --context-dir src/
```

#### `weaver document` - Kod Belgelendirme
```bash
weaver document <dosya_adı> [--style <stil>]

# Örnekler
weaver document utils.js --style jsdoc
weaver document helpers.py --style google
weaver document main.go  # Otomatik GoDoc stili
```

#### `weaver test` - Test Yazma
```bash
weaver test <dosya_adı> [--framework <test_framework>]

# Örnekler
weaver test calculator.py --framework pytest
weaver test api.js --framework jest
weaver test service.go  # Native Go testing
```

#### `weaver review` - Kod İnceleme
```bash
weaver review <dosya_adı> [--task <odak_noktası>]

# Örnekler
weaver review auth.php --task "Check for security vulnerabilities"
weaver review algorithm.py --task "Analyze time complexity and optimization"
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
```

## 🎯 Kullanım Senaryoları

### 1. API Endpoint Oluşturma
```bash
# FastAPI endpoint
weaver new endpoints/products.py --task "Create CRUD endpoints for products with pagination"

# Express.js route
weaver new routes/auth.js --task "Create JWT authentication routes with refresh token"
```

### 2. Legacy Kod Modernizasyonu
```bash
# jQuery'den vanilla JS'e
weaver refactor old_ui.js --task "Convert jQuery code to vanilla JavaScript"

# Class component'ten functional component'e
weaver refactor UserProfile.jsx --task "Convert to functional component with hooks"
```

### 3. Toplu İşlemler
```bash
# Tüm Python dosyalarına type hints ekle
find . -name "*.py" -exec weaver refactor {} --task "Add type hints" \;

# Proje genelinde belgelendirme
for file in src/**/*.js; do
  weaver document "$file" --style jsdoc
done
```

### 4. CI/CD Entegrasyonu
```yaml
# .github/workflows/code-review.yml
- name: AI Code Review
  run: |
    weaver review src/main.go --task "security" > review.md
    cat review.md >> $GITHUB_STEP_SUMMARY
```

## 🔧 Gelişmiş Özellikler

### Özel Model Kullanımı
```bash
# Daha güçlü model
weaver new complex_algorithm.py --model "llama2:70b" --task "Implement distributed consensus algorithm"

# Daha deterministik çıktı
weaver refactor critical_system.go --temperature 0.1 --task "Add comprehensive error handling"
```

### Proje Bağlamı
```bash
# Tüm proje yapısını bağlam olarak kullan
weaver refactor src/services/user.js --context-dir . --task "Align with project patterns"

# Birden fazla dosyayı referans al
weaver new test_integration.py \
  --context-file src/main.py \
  --context-file src/database.py \
  --task "Create integration tests"
```

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

## 📋 Yol Haritası

- [ ] 🌍 Web UI desteği
- [ ] 🔌 VSCode eklentisi
- [ ] 🤖 GitHub Copilot benzeri otomatik tamamlama
- [ ] 📊 Kod metrikleri ve analiz raporları
- [ ] 🔄 Git entegrasyonu (otomatik commit mesajları)
- [ ] 🌐 Uzak Ollama sunucu desteği
- [ ] 📦 Plugin sistemi
- [ ] 🎨 Özelleştirilebilir prompt şablonları

## 🐛 Sorun Giderme

### Ollama Bağlantı Hatası
```bash
# Ollama servisini kontrol et
systemctl status ollama

# Manuel başlat
ollama serve

# API'yi test et
curl http://localhost:11434/api/tags
```

### Model Bulunamadı
```bash
# Mevcut modelleri listele
ollama list

# Önerilen modeli indir
ollama pull codellama:13b-instruct
```

### Performans Sorunları
- Daha küçük model kullanın: `codellama:7b`
- Context derinliğini azaltın
- Büyük dosyaları parçalayın

## 📄 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

## 🙏 Teşekkürler

- [Ollama](https://ollama.ai/) - Yerel AI model desteği
- [Cobra](https://github.com/spf13/cobra) - CLI framework
- [Anthropic Claude](https://anthropic.com) - Bu aracın geliştirilmesinde kullanılan AI

## 📞 İletişim

- **GitHub Issues**: [Sorun Bildir](https://github.com/snowsoft/codeweaver/issues)
- **Discussions**: [Tartışmalar](https://github.com/snowsoft/codeweaver/discussions)
 

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/snowsoft">Snowsoft</a>
</p>

<p align="center">
  <a href="#-code-weaver-kod-dokuyucu">↑ Başa Dön</a>
</p>
