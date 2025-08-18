#!/bin/bash

# Script Testing SEO dan Gambar Logo
# Karate STMKG Website

echo "🧪 Testing SEO dan Gambar Logo Karate STMKG..."

DOMAIN="karate.stmkg.ac.id"
LOGO_URL="https://$DOMAIN/assets/logo_bintangcompress.png"

echo "🌐 Testing domain: $DOMAIN"
echo "🖼️  Testing logo: $LOGO_URL"
echo ""

# Test 1: Basic HTTP Response
echo "📡 Test 1: Basic HTTP Response"
echo "================================"
curl -I "https://$DOMAIN" 2>/dev/null | head -10
echo ""

# Test 2: Logo Image Response
echo "🖼️  Test 2: Logo Image Response"
echo "================================"
curl -I "$LOGO_URL" 2>/dev/null | head -10
echo ""

# Test 3: Sitemap
echo "🗺️  Test 3: Sitemap"
echo "================================"
curl -s "https://$DOMAIN/sitemap.xml" | head -5
echo ""

# Test 4: Robots.txt
echo "🤖 Test 4: Robots.txt"
echo "================================"
curl -s "https://$DOMAIN/robots.txt"
echo ""

# Test 5: Manifest
echo "📱 Test 5: Manifest"
echo "================================"
curl -s "https://$DOMAIN/manifest.json" | head -10
echo ""

# Test 6: SSL Certificate
echo "🔒 Test 6: SSL Certificate"
echo "================================"
echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates
echo ""

# Test 7: Image Download Test
echo "⬇️  Test 7: Image Download Test"
echo "================================"
if curl -s -o /dev/null -w "%{http_code}" "$LOGO_URL" | grep -q "200"; then
    echo "✅ Logo dapat diakses (HTTP 200)"
else
    echo "❌ Logo tidak dapat diakses"
fi
echo ""

# Test 8: Meta Tags Check
echo "🏷️  Test 8: Meta Tags Check"
echo "================================"
curl -s "https://$DOMAIN" | grep -E "(og:image|twitter:image|logo)" | head -5
echo ""

# Test 9: Performance Test
echo "⚡ Test 9: Performance Test"
echo "================================"
curl -s -w "Time: %{time_total}s\nSize: %{size_download} bytes\nSpeed: %{speed_download} bytes/s\n" -o /dev/null "https://$DOMAIN"
echo ""

# Test 10: SEO Score Check
echo "📊 Test 10: SEO Score Check"
echo "================================"
echo "Checking basic SEO elements..."

# Check title
TITLE=$(curl -s "https://$DOMAIN" | grep -o '<title[^>]*>[^<]*</title>' | sed 's/<[^>]*>//g')
if [ ! -z "$TITLE" ]; then
    echo "✅ Title: $TITLE"
else
    echo "❌ Title tidak ditemukan"
fi

# Check description
DESC=$(curl -s "https://$DOMAIN" | grep -o '<meta name="description"[^>]*content="[^"]*"' | sed 's/.*content="//;s/".*//')
if [ ! -z "$DESC" ]; then
    echo "✅ Description: $DESC"
else
    echo "❌ Description tidak ditemukan"
fi

# Check Open Graph image
OG_IMAGE=$(curl -s "https://$DOMAIN" | grep -o '<meta property="og:image"[^>]*content="[^"]*"' | sed 's/.*content="//;s/".*//')
if [ ! -z "$OG_IMAGE" ]; then
    echo "✅ Open Graph Image: $OG_IMAGE"
else
    echo "❌ Open Graph Image tidak ditemukan"
fi

echo ""
echo "🎯 Testing completed!"
echo ""
echo "💡 Tips untuk SEO yang lebih baik:"
echo "1. Pastikan semua meta tags terisi dengan benar"
echo "2. Gambar logo harus dapat diakses dengan URL absolut"
echo "3. Sitemap.xml harus valid dan dapat diakses"
echo "4. Robots.txt harus mengizinkan crawling"
echo "5. SSL certificate harus valid"
echo "6. Website harus responsive dan cepat loading"
