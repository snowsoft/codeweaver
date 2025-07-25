@echo off
echo CodeWeaver Desktop - Webpack sorununu çözüyor...

echo 1. Local webpack kurulumu kontrol ediliyor...
if exist node_modules\webpack (
    echo ✓ Webpack zaten kurulu
) else (
    echo ✗ Webpack bulunamadı, kuruluyor...
    npm install --save-dev webpack webpack-cli webpack-dev-server
)

echo.
echo 2. Package.json scripts kontrol ediliyor...
echo Scripts bölümüne şunları ekleyin:
echo "scripts": {
echo   "dev": "webpack serve --config webpack.renderer.config.js --mode development --port 3456",
echo   "build": "webpack --config webpack.renderer.config.js --mode production",
echo   "start": "npm run dev"
echo }

echo.
echo 3. Webpack konfigürasyonu kontrol ediliyor...
if exist webpack.renderer.config.js (
    echo ✓ Webpack config dosyası bulundu
) else (
    echo ✗ Webpack config dosyası bulunamadı!
    echo Webpack konfigürasyon dosyasını oluşturun.
)

echo.
echo 4. Çözümler:
echo a) npm run dev
echo b) npx webpack-dev-server --config webpack.renderer.config.js --mode development --port 3456
echo c) ./node_modules/.bin/webpack serve --config webpack.renderer.config.js --mode development

pause