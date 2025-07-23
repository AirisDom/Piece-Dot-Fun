#!/bin/bash

# Piece Market Fun Backend Setup Script
echo "🚀 Setting up Piece Market Fun Backend..."

# Check if we're in the backend directory
if [ ! -f "artisan" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check PHP version
php_version=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
if (( $(echo "$php_version < 8.2" | bc -l) )); then
    echo "❌ PHP 8.2 or higher is required. Current version: $php_version"
    exit 1
fi

echo "✅ PHP version check passed: $php_version"

# Install Composer dependencies
echo "📦 Installing Composer dependencies..."
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed. Please install Composer first."
    exit 1
fi

composer install --no-dev --optimize-autoloader

# Setup environment
echo "⚙️ Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
else
    echo "⚠️ .env file already exists, skipping copy"
fi

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Install Laravel Sanctum
echo "🔐 Installing Laravel Sanctum..."
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

# Setup database
echo "🗄️ Setting up database..."
touch database/database.sqlite

# Run migrations
echo "🏗️ Running database migrations..."
php artisan migrate --force

# Seed database
echo "🌱 Seeding database with sample data..."
php artisan db:seed

# Create storage link
echo "🔗 Creating storage link..."
php artisan storage:link

# Clear and cache config
echo "🧹 Optimizing application..."
php artisan config:cache
php artisan route:cache

# Install Sanctum personal access tokens migration
echo "🎫 Setting up API tokens..."
php artisan migrate --path=vendor/laravel/sanctum/database/migrations --force

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Review and update .env file with your settings"
echo "2. Start the server: php artisan serve"
echo "3. Visit: http://localhost:8000"
echo ""
echo "🔑 Test credentials:"
echo "Email: admin@piecemarket.fun"
echo "Password: password123"
echo ""
echo "📚 API Documentation:"
echo "- Markets: GET /api/markets"
echo "- Products: GET /api/products"  
echo "- Auth: POST /api/auth/login"
echo ""
echo "💡 Useful commands:"
echo "- Fresh start: php artisan migrate:fresh --seed"
echo "- Clear cache: php artisan cache:clear"
echo "- Run tests: php artisan test"
echo ""
echo "🌐 CORS is configured for: http://localhost:3000"
echo "Make sure your frontend runs on this port."
