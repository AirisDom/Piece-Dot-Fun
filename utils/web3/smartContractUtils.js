import { 
  Program, 
  AnchorProvider, 
  web3, 
  utils, 
  BN,
  Wallet 
} from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';

// Smart contract utilities for Piece Dot Fun
export class SmartContractUtils {
  constructor(connection, wallet, programId, idl) {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = new PublicKey(programId);
    this.idl = idl;
    this.program = null;
    this.provider = null;
    this.initialize();
  }

  // Initialize Anchor program
  initialize() {
    try {
      this.provider = new AnchorProvider(
        this.connection,
        this.wallet,
        AnchorProvider.defaultOptions()
      );
      
      this.program = new Program(this.idl, this.programId, this.provider);
    } catch (error) {
      console.error('Failed to initialize smart contract:', error);
    }
  }

  // Get program derived address
  async findProgramAddress(seeds, programId = this.programId) {
    return await PublicKey.findProgramAddress(seeds, programId);
  }

  // Market-related functions
  async createMarket(name, description, owner) {
    try {
      const [marketPDA] = await this.findProgramAddress([
        Buffer.from('market'),
        owner.toBuffer(),
        Buffer.from(name)
      ]);

      const tx = await this.program.methods
        .createMarket(name, description)
        .accounts({
          market: marketPDA,
          owner: owner,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, marketPDA };
    } catch (error) {
      throw new Error(`Failed to create market: ${error.message}`);
    }
  }

  async getMarket(marketPDA) {
    try {
      const market = await this.program.account.market.fetch(marketPDA);
      return market;
    } catch (error) {
      throw new Error(`Failed to fetch market: ${error.message}`);
    }
  }

  async updateMarket(marketPDA, name, description) {
    try {
      const tx = await this.program.methods
        .updateMarket(name, description)
        .accounts({
          market: marketPDA,
          owner: this.wallet.publicKey,
        })
        .rpc();

      return tx;
    } catch (error) {
      throw new Error(`Failed to update market: ${error.message}`);
    }
  }

  // Product-related functions
  async createProduct(marketPDA, name, description, price, stock) {
    try {
      const [productPDA] = await this.findProgramAddress([
        Buffer.from('product'),
        marketPDA.toBuffer(),
        Buffer.from(name)
      ]);

      const tx = await this.program.methods
        .createProduct(name, description, new BN(price), new BN(stock))
        .accounts({
          product: productPDA,
          market: marketPDA,
          owner: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, productPDA };
    } catch (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  async getProduct(productPDA) {
    try {
      const product = await this.program.account.product.fetch(productPDA);
      return product;
    } catch (error) {
      throw new Error(`Failed to fetch product: ${error.message}`);
    }
  }

  async updateProductStock(productPDA, newStock) {
    try {
      const tx = await this.program.methods
        .updateProductStock(new BN(newStock))
        .accounts({
          product: productPDA,
          owner: this.wallet.publicKey,
        })
        .rpc();

      return tx;
    } catch (error) {
      throw new Error(`Failed to update product stock: ${error.message}`);
    }
  }

  // Order-related functions
  async createOrder(productPDA, quantity, buyerAddress) {
    try {
      const [orderPDA] = await this.findProgramAddress([
        Buffer.from('order'),
        productPDA.toBuffer(),
        buyerAddress.toBuffer(),
        Buffer.from(Date.now().toString())
      ]);

      const tx = await this.program.methods
        .createOrder(new BN(quantity))
        .accounts({
          order: orderPDA,
          product: productPDA,
          buyer: buyerAddress,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, orderPDA };
    } catch (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
  }

  async getOrder(orderPDA) {
    try {
      const order = await this.program.account.order.fetch(orderPDA);
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
  }

  async fulfillOrder(orderPDA, sellerAddress) {
    try {
      const tx = await this.program.methods
        .fulfillOrder()
        .accounts({
          order: orderPDA,
          seller: sellerAddress,
        })
        .rpc();

      return tx;
    } catch (error) {
      throw new Error(`Failed to fulfill order: ${error.message}`);
    }
  }

  // Payment and transaction functions
  async processPayment(orderPDA, amount, buyerAddress, sellerAddress) {
    try {
      const [escrowPDA] = await this.findProgramAddress([
        Buffer.from('escrow'),
        orderPDA.toBuffer()
      ]);

      const tx = await this.program.methods
        .processPayment(new BN(amount))
        .accounts({
          escrow: escrowPDA,
          order: orderPDA,
          buyer: buyerAddress,
          seller: sellerAddress,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, escrowPDA };
    } catch (error) {
      throw new Error(`Failed to process payment: ${error.message}`);
    }
  }

  async releasePayment(escrowPDA, orderPDA) {
    try {
      const tx = await this.program.methods
        .releasePayment()
        .accounts({
          escrow: escrowPDA,
          order: orderPDA,
          buyer: this.wallet.publicKey,
        })
        .rpc();

      return tx;
    } catch (error) {
      throw new Error(`Failed to release payment: ${error.message}`);
    }
  }

  // User profile functions
  async createUserProfile(username, email) {
    try {
      const [userPDA] = await this.findProgramAddress([
        Buffer.from('user'),
        this.wallet.publicKey.toBuffer()
      ]);

      const tx = await this.program.methods
        .createUserProfile(username, email)
        .accounts({
          userProfile: userPDA,
          user: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, userPDA };
    } catch (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }
  }

  async getUserProfile(userAddress) {
    try {
      const [userPDA] = await this.findProgramAddress([
        Buffer.from('user'),
        userAddress.toBuffer()
      ]);

      const userProfile = await this.program.account.userProfile.fetch(userPDA);
      return { userProfile, userPDA };
    } catch (error) {
      throw new Error(`Failed to fetch user profile: ${error.message}`);
    }
  }

  // Review and rating functions
  async createReview(targetPDA, rating, comment, targetType = 'product') {
    try {
      const [reviewPDA] = await this.findProgramAddress([
        Buffer.from('review'),
        targetPDA.toBuffer(),
        this.wallet.publicKey.toBuffer()
      ]);

      const tx = await this.program.methods
        .createReview(rating, comment, targetType)
        .accounts({
          review: reviewPDA,
          target: targetPDA,
          reviewer: this.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      return { signature: tx, reviewPDA };
    } catch (error) {
      throw new Error(`Failed to create review: ${error.message}`);
    }
  }

  // Utility functions
  async getAllMarkets() {
    try {
      const markets = await this.program.account.market.all();
      return markets;
    } catch (error) {
      throw new Error(`Failed to fetch all markets: ${error.message}`);
    }
  }

  async getAllProducts() {
    try {
      const products = await this.program.account.product.all();
      return products;
    } catch (error) {
      throw new Error(`Failed to fetch all products: ${error.message}`);
    }
  }

  async getProductsByMarket(marketPDA) {
    try {
      const products = await this.program.account.product.all([
        {
          memcmp: {
            offset: 8, // Skip discriminator
            bytes: marketPDA.toBase58(),
          },
        },
      ]);
      return products;
    } catch (error) {
      throw new Error(`Failed to fetch products by market: ${error.message}`);
    }
  }

  async getOrdersByUser(userAddress) {
    try {
      const orders = await this.program.account.order.all([
        {
          memcmp: {
            offset: 8 + 32, // Skip discriminator and product pubkey
            bytes: userAddress.toBase58(),
          },
        },
      ]);
      return orders;
    } catch (error) {
      throw new Error(`Failed to fetch orders by user: ${error.message}`);
    }
  }

  // Event listeners
  addEventListener(eventName, callback) {
    if (this.program) {
      return this.program.addEventListener(eventName, callback);
    }
  }

  removeEventListener(listenerId) {
    if (this.program) {
      return this.program.removeEventListener(listenerId);
    }
  }

  // Transaction building utilities
  async buildTransaction(instructions) {
    const transaction = new web3.Transaction();
    instructions.forEach(ix => transaction.add(ix));
    
    const { blockhash } = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = this.wallet.publicKey;
    
    return transaction;
  }

  async simulateTransaction(transaction) {
    try {
      const simulation = await this.connection.simulateTransaction(transaction);
      return {
        success: simulation.value.err === null,
        logs: simulation.value.logs,
        error: simulation.value.err,
      };
    } catch (error) {
      throw new Error(`Transaction simulation failed: ${error.message}`);
    }
  }
}

// Helper functions
export const createSmartContractInstance = (connection, wallet, programId, idl) => {
  return new SmartContractUtils(connection, wallet, programId, idl);
};

export const serializeInstruction = (instruction) => {
  return {
    programId: instruction.programId.toBase58(),
    keys: instruction.keys.map(key => ({
      pubkey: key.pubkey.toBase58(),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: instruction.data.toString('base64'),
  };
};

export const deserializeInstruction = (serializedIx) => {
  return {
    programId: new PublicKey(serializedIx.programId),
    keys: serializedIx.keys.map(key => ({
      pubkey: new PublicKey(key.pubkey),
      isSigner: key.isSigner,
      isWritable: key.isWritable,
    })),
    data: Buffer.from(serializedIx.data, 'base64'),
  };
};

export default SmartContractUtils;
