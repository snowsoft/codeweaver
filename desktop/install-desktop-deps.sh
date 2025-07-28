#!/bin/bash

echo "CodeWeaver Desktop UI - Bağımlılıkları kuruluyor..."

# Ana bağımlılıkları kur
echo "1. Tailwind CSS ve PostCSS kuruluyor..."
npm install --save-dev @tailwindcss/postcss autoprefixer tailwindcss tailwindcss-animate

echo "2. Radix UI bileşenleri kuruluyor..."
npm install @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-tabs

echo "3. Utility kütüphaneleri kuruluyor..."
npm install class-variance-authority clsx tailwind-merge

echo "4. Icon kütüphanesi kuruluyor..."
npm install lucide-react

echo "5. D3.js type hatalarını düzeltmek için..."
npm install --save-dev @types/d3

echo "✅ Tüm bağımlılıklar başarıyla kuruldu!"
echo ""
echo "Sonraki adımlar:"
echo "1. Yukarıdaki artifact dosyalarını ilgili klasörlere kopyalayın"
echo "2. npm run dev veya npx webpack serve komutunu çalıştırın"
echo "3. CodeWeaver Desktop UI artık hatasız çalışmalı!"