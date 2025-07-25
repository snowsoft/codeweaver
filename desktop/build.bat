# === ADIM 1: Babel Kurulumu ===
echo "Babel paketleri kuruluyor..."
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react @babel/preset-typescript babel-loader

# === ADIM 2: ts-loader kaldırma ===
echo "ts-loader kaldırılıyor..."
npm uninstall ts-loader

# === ADIM 3: Cache temizleme ===
echo "Cache temizleniyor..."
rm -rf node_modules/.cache
rm -rf dist
rm -rf .webpack
npm cache clean --force

# === ADIM 4: .babelrc.json oluşturma ===
echo "Babel config oluşturuluyor..."
cat > .babelrc.json << 'EOF'
{
  "presets": [
    "@babel/preset-env",
    ["@babel/preset-react", { "runtime": "automatic" }],
    "@babel/preset-typescript"
  ]
}
EOF

# === ADIM 5: webpack.renderer.config.js güncelleme ===
echo "Webpack config güncelleniyor..."
# Yukarıdaki babel webpack config'i kullanın

# === ADIM 6: index.tsx güncelleme ===
echo "index.tsx güncelleniyor..."
# Yukarıdaki temiz index.tsx'i kullanın

# === ADIM 7: Çalıştırma ===
echo "Uygulama başlatılıyor..."
npm run dev

echo "✅ Çözüm tamamlandı!"
echo "Tarayıcınızda http://localhost:3456 adresini açın"