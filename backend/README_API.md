# Piece Market Fun - Backend API

A Laravel-based REST API for a decentralized marketplace built on Solana blockchain.

## Features

- **User Management**: Registration, authentication, and profile management
- **Market System**: Create and manage decentralized markets
- **Product Catalog**: Full product management with inventory tracking
- **Order Processing**: Complete order lifecycle management
- **Cart System**: Shopping cart functionality
- **Transaction Tracking**: Blockchain transaction monitoring
- **Wallet Integration**: Solana wallet authentication
- **Location-based Services**: Geolocation for markets and shipping

## Tech Stack

- **Framework**: Laravel 11
- **Database**: SQLite (configurable)
- **Authentication**: Laravel Sanctum
- **API**: RESTful API with JSON responses
- **Blockchain**: Solana integration
- **Testing**: PHPUnit

## Installation

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js (for frontend integration)

### Setup

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Configure environment variables**
   Edit `.env` file with your settings:
   ```bash
   APP_NAME="Piece Market Fun"
   APP_URL=http://localhost:8000
   
   # Database
   DB_CONNECTION=sqlite
   
   # Frontend CORS
   CORS_ALLOWED_ORIGINS="http://localhost:3000"
   
   # Blockchain
   SOLANA_RPC_ENDPOINT="https://api.devnet.solana.com"
   PROGRAM_ID="your_program_id_here"
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Start the server**
   ```bash
   php artisan serve
   ```

The API will be available at `http://localhost:8000`

## Quick Start

After installation, you can:

1. **Test the API**: Visit `http://localhost:8000/api/markets` to see sample markets
2. **Login as admin**: Use `admin@piecemarket.fun` / `password123`
3. **Explore endpoints**: Check the API documentation below

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/wallet-login` - Login with wallet signature
- `POST /api/auth/logout` - Logout
- `GET /api/auth/user` - Get current user

### Markets
- `GET /api/markets` - List all markets (public)
- `POST /api/markets` - Create market (auth required)
- `GET /api/markets/{id}` - Get market details
- `PUT /api/markets/{id}` - Update market
- `DELETE /api/markets/{id}` - Delete market
- `GET /api/my-markets` - Get user's markets

### Products
- `GET /api/products` - List products (public)
- `POST /api/products` - Create product (auth required)
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product
- `GET /api/my-products` - Get user's products

### Orders
- `GET /api/orders` - List orders
- `POST /api/orders` - Create order
- `GET /api/orders/{id}` - Get order details
- `GET /api/my-orders` - Get user's orders
- `GET /api/market-orders` - Get market's orders
- `PATCH /api/orders/{id}/confirm` - Confirm order
- `PATCH /api/orders/{id}/cancel` - Cancel order

### Cart
- `GET /api/cart` - Get cart items
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/{id}` - Update cart item
- `DELETE /api/cart/{id}` - Remove cart item
- `POST /api/cart/checkout` - Checkout cart

### Transactions
- `GET /api/transactions` - List transactions
- `GET /api/my-transactions` - Get user's transactions
- `POST /api/transactions/funding` - Record funding
- `POST /api/transactions/withdrawal` - Request withdrawal

## Sample Data

The seeder creates:
- 1 admin user (`admin@piecemarket.fun` / `password123`)
- 20 sample users with wallet addresses
- 8-16 markets across different categories
- 5-15 products per market
- Sample orders and transactions
- Cart items for some users

## Database Models

### Core Models
- **User**: User accounts with wallet integration
- **Market**: Decentralized marketplace stores  
- **Product**: Items sold in markets
- **Order**: Purchase orders with items
- **OrderItem**: Individual items in orders
- **CartItem**: Shopping cart items
- **Transaction**: Blockchain transaction records
- **ShippingZone**: Market shipping areas

## Security Features

- **Laravel Sanctum**: Token-based API authentication
- **CORS Protection**: Configured for frontend domain
- **Validation**: Comprehensive input validation
- **Authorization**: Route and resource-level permissions
- **Rate Limiting**: API rate limiting protection

## Development

### Key Directories
```
app/
├── Http/Controllers/Api/    # API Controllers
├── Http/Resources/          # API Resources  
├── Models/                  # Eloquent Models
database/
├── factories/              # Model Factories
├── migrations/             # Database Migrations
└── seeders/               # Database Seeders
routes/
└── api.php                # API Routes
```

### Running Tests
```bash
php artisan test
```

### Useful Commands
```bash
# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear

# Database operations
php artisan migrate:fresh --seed
php artisan db:wipe

# Generate new API token
php artisan tinker
>>> $user = App\Models\User::first()
>>> $user->createToken('api-token')->plainTextToken
```

## Integration with Frontend

This backend is designed to work with the Next.js frontend in the parent directory. Key integration points:

- **CORS**: Configured for `localhost:3000`
- **Authentication**: Sanctum tokens for API access
- **Wallet Integration**: Support for Solana wallet authentication
- **Real-time Updates**: Ready for WebSocket integration

## Blockchain Integration

The API supports Solana blockchain integration:

- **Wallet Authentication**: Verify wallet signatures
- **Transaction Tracking**: Monitor blockchain transactions  
- **Program Integration**: Ready for Solana program calls
- **Webhook Support**: Handle blockchain events

## Production Deployment

For production:

1. **Environment**: Set `APP_ENV=production`, `APP_DEBUG=false`
2. **Database**: Configure production database
3. **CORS**: Update allowed origins
4. **Caching**: Enable route/config caching
5. **Queue**: Set up job queues for background processing
6. **Monitoring**: Add logging and error tracking

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality  
4. Submit a pull request

## License

MIT License
