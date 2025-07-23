<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\{Transaction, Market};
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with(['user', 'market', 'order']);

        // Filter by type
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        // Filter by currency
        if ($request->has('currency')) {
            $query->where('currency', $request->currency);
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->byUser($request->user_id);
        }

        // Filter by market
        if ($request->has('market_id')) {
            $query->byMarket($request->market_id);
        }

        // Date range filter
        if ($request->has('from_date')) {
            $query->whereDate('created_at', '>=', $request->from_date);
        }
        if ($request->has('to_date')) {
            $query->whereDate('created_at', '<=', $request->to_date);
        }

        $transactions = $query->orderBy('created_at', 'desc')
                             ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => TransactionResource::collection($transactions->items()),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ]
        ]);
    }

    public function show(Transaction $transaction, Request $request): JsonResponse
    {
        $user = $request->user();
        $userMarketIds = Market::where('user_id', $user->id)->pluck('id');

        // Users can only view their own transactions or transactions from their markets
        if ($transaction->user_id !== $user->id && !$userMarketIds->contains($transaction->market_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $transaction->load(['user', 'market', 'order']);

        return response()->json([
            'success' => true,
            'data' => new TransactionResource($transaction)
        ]);
    }

    public function myTransactions(Request $request): JsonResponse
    {
        $query = Transaction::where('user_id', $request->user()->id)
                           ->with(['market', 'order']);

        // Apply filters
        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if ($request->has('status')) {
            $query->byStatus($request->status);
        }

        if ($request->has('currency')) {
            $query->where('currency', $request->currency);
        }

        $transactions = $query->orderBy('created_at', 'desc')
                             ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => TransactionResource::collection($transactions->items()),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total()
            ]
        ]);
    }

    public function funding(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|in:SOL,USDC,TOKEN',
            'transaction_hash' => 'required|string',
            'from_wallet' => 'required|string',
            'to_wallet' => 'required|string',
            'blockchain_signature' => 'nullable|string',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // TODO: Verify transaction on blockchain before creating record
            // This would involve checking the transaction hash on Solana

            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'type' => Transaction::TYPE_FUNDING,
                'status' => Transaction::STATUS_PENDING,
                'amount' => $request->amount,
                'currency' => $request->currency,
                'transaction_hash' => $request->transaction_hash,
                'blockchain_signature' => $request->blockchain_signature,
                'from_wallet' => $request->from_wallet,
                'to_wallet' => $request->to_wallet,
                'description' => $request->description ?? 'Wallet funding',
                'processed_at' => now()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Funding transaction recorded successfully',
                'data' => new TransactionResource($transaction)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record funding transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function withdrawal(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'amount' => 'required|numeric|min:0.01',
            'currency' => 'required|string|in:SOL,USDC,TOKEN',
            'to_wallet' => 'required|string',
            'description' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // TODO: Check user balance before allowing withdrawal
            // TODO: Process withdrawal on blockchain

            $transaction = Transaction::create([
                'user_id' => $request->user()->id,
                'type' => Transaction::TYPE_WITHDRAWAL,
                'status' => Transaction::STATUS_PENDING,
                'amount' => $request->amount,
                'currency' => $request->currency,
                'from_wallet' => $request->user()->wallet_address,
                'to_wallet' => $request->to_wallet,
                'description' => $request->description ?? 'Wallet withdrawal'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Withdrawal request created successfully',
                'data' => new TransactionResource($transaction)
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create withdrawal request',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function confirm(Transaction $transaction, Request $request): JsonResponse
    {
        // Only allow confirmation for pending transactions
        if ($transaction->status !== Transaction::STATUS_PENDING) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction is not in pending status'
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'transaction_hash' => 'sometimes|string',
            'blockchain_signature' => 'sometimes|string',
            'gas_fee' => 'sometimes|numeric|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = [
                'status' => Transaction::STATUS_CONFIRMED,
                'confirmed_at' => now()
            ];

            if ($request->has('transaction_hash')) {
                $updateData['transaction_hash'] = $request->transaction_hash;
            }

            if ($request->has('blockchain_signature')) {
                $updateData['blockchain_signature'] = $request->blockchain_signature;
            }

            if ($request->has('gas_fee')) {
                $updateData['gas_fee'] = $request->gas_fee;
            }

            $transaction->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Transaction confirmed successfully',
                'data' => new TransactionResource($transaction)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm transaction',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function analytics(Request $request): JsonResponse
    {
        $user = $request->user();
        $userMarketIds = Market::where('user_id', $user->id)->pluck('id');

        $analytics = [
            // User's personal transactions
            'personal' => [
                'total_funding' => Transaction::where('user_id', $user->id)
                    ->funding()
                    ->confirmed()
                    ->sum('amount'),
                'total_withdrawals' => Transaction::where('user_id', $user->id)
                    ->withdrawals()
                    ->confirmed()
                    ->sum('amount'),
                'total_purchases' => Transaction::where('user_id', $user->id)
                    ->purchases()
                    ->confirmed()
                    ->sum('amount'),
                'pending_transactions' => Transaction::where('user_id', $user->id)
                    ->pending()
                    ->count()
            ],
            
            // Market transactions (if user has markets)
            'markets' => [
                'total_sales' => Transaction::whereIn('market_id', $userMarketIds)
                    ->sales()
                    ->confirmed()
                    ->sum('amount'),
                'monthly_sales' => Transaction::whereIn('market_id', $userMarketIds)
                    ->sales()
                    ->confirmed()
                    ->whereMonth('created_at', now()->month)
                    ->sum('amount'),
                'weekly_sales' => Transaction::whereIn('market_id', $userMarketIds)
                    ->sales()
                    ->confirmed()
                    ->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()])
                    ->sum('amount'),
                'total_fees' => Transaction::whereIn('market_id', $userMarketIds)
                    ->where('type', Transaction::TYPE_FEE)
                    ->confirmed()
                    ->sum('amount')
            ]
        ];

        return response()->json([
            'success' => true,
            'data' => $analytics
        ]);
    }

    public function blockchainWebhook(Request $request): JsonResponse
    {
        // This endpoint would be called by blockchain monitoring services
        // to update transaction statuses based on blockchain events
        
        $validator = Validator::make($request->all(), [
            'transaction_hash' => 'required|string',
            'status' => 'required|string|in:confirmed,failed',
            'gas_fee' => 'nullable|numeric',
            'block_number' => 'nullable|integer',
            'signature' => 'required|string' // Webhook signature for verification
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // TODO: Verify webhook signature
            
            $transaction = Transaction::where('transaction_hash', $request->transaction_hash)->first();
            
            if (!$transaction) {
                return response()->json([
                    'success' => false,
                    'message' => 'Transaction not found'
                ], 404);
            }

            $updateData = [
                'status' => $request->status === 'confirmed' 
                    ? Transaction::STATUS_CONFIRMED 
                    : Transaction::STATUS_FAILED
            ];

            if ($request->status === 'confirmed') {
                $updateData['confirmed_at'] = now();
            }

            if ($request->has('gas_fee')) {
                $updateData['gas_fee'] = $request->gas_fee;
            }

            if ($request->has('block_number')) {
                $metadata = $transaction->metadata ?? [];
                $metadata['block_number'] = $request->block_number;
                $updateData['metadata'] = $metadata;
            }

            $transaction->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Transaction status updated successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update transaction status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
