# Önce dizinleri oluştur
New-Item -ItemType Directory -Force -Path "src/i18n/locales"

# i18n/index.ts dosyasını oluştur
$i18nIndex = @'
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import tr from './locales/tr.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      tr: { translation: tr }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
'@

Set-Content -Path "src/i18n/index.ts" -Value $i18nIndex -Encoding UTF8
Write-Host "Created: src/i18n/index.ts"

# English translations
$enJson = @'
{
  "app": {
    "title": "CodeWeaver Desktop",
    "ready": "Ready",
    "connected": "Connected",
    "model": "Model"
  },
  "navigation": {
    "title": "Navigation",
    "dashboard": "Dashboard",
    "generate": "Generate",
    "refactor": "Refactor",
    "document": "Document",
    "test": "Test",
    "review": "Review",
    "history": "History",
    "settings": "Settings"
  },
  "dashboard": {
    "title": "CodeWeaver Dashboard",
    "stats": {
      "totalFiles": "Total Files",
      "codeGenerated": "Code Generated",
      "testsCreated": "Tests Created",
      "reviewsDone": "Reviews Done"
    },
    "recentActivities": "Recent Activities",
    "activities": {
      "generated": "Generated",
      "refactored": "Refactored",
      "documented": "Documented",
      "tested": "Tested"
    },
    "quickActions": {
      "generate": "Generate Code",
      "refactor": "Refactor Code",
      "createTests": "Create Tests",
      "review": "Review Code"
    }
  },
  "generate": {
    "title": "Generate Code",
    "fileName": "File Name",
    "fileNamePlaceholder": "e.g., user_service.py",
    "taskDescription": "Task Description",
    "taskPlaceholder": "Describe what you want to generate...",
    "generateButton": "Generate Code",
    "generating": "Generating...",
    "output": "Output",
    "outputPlaceholder": "Output will appear here...",
    "fillAllFields": "Please fill in all fields"
  },
  "settings": {
    "title": "Settings",
    "language": "Language",
    "theme": "Theme",
    "themes": {
      "light": "Light",
      "dark": "Dark",
      "system": "System"
    },
    "editor": "Editor Settings",
    "fontSize": "Font Size",
    "tabSize": "Tab Size",
    "wordWrap": "Word Wrap",
    "on": "On",
    "off": "Off"
  },
  "fileExplorer": {
    "title": "File Explorer",
    "newFile": "New File",
    "newFolder": "New Folder",
    "delete": "Delete",
    "rename": "Rename"
  },
  "terminal": {
    "title": "Terminal",
    "clear": "Clear",
    "close": "Close"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "open": "Open",
    "close": "Close",
    "yes": "Yes",
    "no": "No",
    "confirm": "Confirm",
    "error": "Error",
    "success": "Success",
    "warning": "Warning"
  }
}
'@

Set-Content -Path "src/i18n/locales/en.json" -Value $enJson -Encoding UTF8
Write-Host "Created: src/i18n/locales/en.json"

# Turkish translations
$trJson = @'
{
  "app": {
    "title": "CodeWeaver Masaüstü",
    "ready": "Hazır",
    "connected": "Bağlı",
    "model": "Model"
  },
  "navigation": {
    "title": "Gezinme",
    "dashboard": "Kontrol Paneli",
    "generate": "Oluştur",
    "refactor": "Yeniden Düzenle",
    "document": "Belgele",
    "test": "Test",
    "review": "İncele",
    "history": "Geçmiş",
    "settings": "Ayarlar"
  },
  "dashboard": {
    "title": "CodeWeaver Kontrol Paneli",
    "stats": {
      "totalFiles": "Toplam Dosya",
      "codeGenerated": "Üretilen Kod",
      "testsCreated": "Oluşturulan Test",
      "reviewsDone": "Yapılan İnceleme"
    },
    "recentActivities": "Son Aktiviteler",
    "activities": {
      "generated": "Oluşturuldu",
      "refactored": "Yeniden düzenlendi",
      "documented": "Belgelendi",
      "tested": "Test edildi"
    },
    "quickActions": {
      "generate": "Kod Oluştur",
      "refactor": "Kod Düzenle",
      "createTests": "Test Oluştur",
      "review": "Kod İncele"
    }
  },
  "generate": {
    "title": "Kod Oluştur",
    "fileName": "Dosya Adı",
    "fileNamePlaceholder": "örn., kullanici_servisi.py",
    "taskDescription": "Görev Açıklaması",
    "taskPlaceholder": "Ne oluşturmak istediğinizi açıklayın...",
    "generateButton": "Kod Oluştur",
    "generating": "Oluşturuluyor...",
    "output": "Çıktı",
    "outputPlaceholder": "Çıktı burada görünecek...",
    "fillAllFields": "Lütfen tüm alanları doldurun"
  },
  "settings": {
    "title": "Ayarlar",
    "language": "Dil",
    "theme": "Tema",
    "themes": {
      "light": "Açık",
      "dark": "Koyu",
      "system": "Sistem"
    },
    "editor": "Editör Ayarları",
    "fontSize": "Yazı Boyutu",
    "tabSize": "Sekme Boyutu",
    "wordWrap": "Sözcük Kaydırma",
    "on": "Açık",
    "off": "Kapalı"
  },
  "fileExplorer": {
    "title": "Dosya Gezgini",
    "newFile": "Yeni Dosya",
    "newFolder": "Yeni Klasör",
    "delete": "Sil",
    "rename": "Yeniden Adlandır"
  },
  "terminal": {
    "title": "Terminal",
    "clear": "Temizle",
    "close": "Kapat"
  },
  "common": {
    "save": "Kaydet",
    "cancel": "İptal",
    "delete": "Sil",
    "edit": "Düzenle",
    "open": "Aç",
    "close": "Kapat",
    "yes": "Evet",
    "no": "Hayır",
    "confirm": "Onayla",
    "error": "Hata",
    "success": "Başarılı",
    "warning": "Uyarı"
  }
}
'@

Set-Content -Path "src/i18n/locales/tr.json" -Value $trJson -Encoding UTF8
Write-Host "Created: src/i18n/locales/tr.json"

Write-Host "All i18n files created successfully!"