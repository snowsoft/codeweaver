@echo off
echo ========================================
echo CodeWeaver Desktop - Tüm Bağımlılıkları Kurulumu
echo ========================================

echo.
echo 1. React ve React DOM kuruluyor...
npm install react react-dom

echo.
echo 2. React TypeScript tipleri kuruluyor...
npm install --save-dev @types/react @types/react-dom

echo.
echo 3. Webpack ve loader'lar kuruluyor...
npm install --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin

echo.
echo 4. TypeScript ve loader'ı kuruluyor...
npm install --save-dev typescript ts-loader

echo.
echo 5. CSS loader'ları kuruluyor...
npm install --save-dev css-loader style-loader postcss-loader

echo.
echo 6. Tailwind CSS kuruluyor...
npm install --save-dev @tailwindcss/postcss autoprefixer tailwindcss tailwindcss-animate

echo.
echo 7. Utility kütüphaneleri kuruluyor...
npm install clsx tailwind-merge class-variance-authority

echo.
echo 8. Radix UI bileşenleri kuruluyor...
npm install @radix-ui/react-slot @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-scroll-area @radix-ui/react-tabs

echo.
echo 9. Icon kütüphanesi kuruluyor...
npm install lucide-react

echo.
echo 10. D3.js kuruluyor...
npm install d3
npm install --save-dev @types/d3

echo.
echo 11. React Force Graph kuruluyor...
npm install react-force-graph

echo.
echo ✅ Tüm bağımlılıklar başarıyla kuruldu!
echo.
echo Sonraki adım: npm run dev