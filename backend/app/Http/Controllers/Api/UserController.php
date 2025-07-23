<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['markets', 'cartItems', 'orders']);

        if ($request->has('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('wallet_address', 'like', '%' . $request->search . '%');
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        $users = $query->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users->items()),
            'meta' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total()
            ]
        ]);
    }

    public function show(User $user): JsonResponse
    {
        $user->load(['markets', 'cartItems.product', 'orders.orderItems', 'transactions']);

        return response()->json([
            'success' => true,
            'data' => new UserResource($user)
        ]);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        // Users can only update their own profile
        if ($user->id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string',
            'address' => 'sometimes|nullable|string',
            'city' => 'sometimes|nullable|string',
            'country' => 'sometimes|nullable|string',
            'postal_code' => 'sometimes|nullable|string',
            'profile_image' => 'sometimes|nullable|url'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $user->update($request->only([
            'name', 'email', 'phone', 'address', 'city', 
            'country', 'postal_code', 'profile_image'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => new UserResource($user)
        ]);
    }

    public function destroy(User $user, Request $request): JsonResponse
    {
        // Users can only delete their own account
        if ($user->id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Account deleted successfully'
        ]);
    }

    public function activate(User $user): JsonResponse
    {
        $user->update(['is_active' => true]);

        return response()->json([
            'success' => true,
            'message' => 'User activated successfully',
            'data' => new UserResource($user)
        ]);
    }

    public function deactivate(User $user): JsonResponse
    {
        $user->update(['is_active' => false]);

        return response()->json([
            'success' => true,
            'message' => 'User deactivated successfully',
            'data' => new UserResource($user)
        ]);
    }
}
