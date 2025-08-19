const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: [true, 'Item ID is required']
  },
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Item price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  image: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    trim: true
  },
  itemTotal: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Calculate item total
cartItemSchema.pre('save', function(next) {
  this.itemTotal = this.price * this.quantity;
  next();
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: [true, 'Restaurant ID is required'],
    index: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cartSchema.index({ userId: 1, restaurantId: 1 });

// Virtual for cart summary
cartSchema.virtual('itemCount').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Method to calculate cart totals
cartSchema.methods.calculateTotals = function() {
  console.log('🛒 [CART_MODEL] Calculating totals for cart:', this._id);
  
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => {
    return sum + item.itemTotal;
  }, 0);
  
  // Total is same as subtotal (no delivery fee)
  this.total = this.subtotal;
  
  console.log('🛒 [CART_MODEL] Cart totals calculated:', {
    subtotal: this.subtotal,
    total: this.total
  });
  
  return {
    subtotal: this.subtotal,
    total: this.total
  };
};

// Method to add item to cart
cartSchema.methods.addItem = function(itemData) {
  console.log('🛒 [CART_MODEL] Adding item to cart:', {
    cartId: this._id,
    itemData: {
      name: itemData.name,
      price: itemData.price,
      quantity: itemData.quantity
    }
  });
  
  // Check if item already exists
  const existingItemIndex = this.items.findIndex(item => 
    item.itemId.toString() === itemData.itemId.toString()
  );
  
  if (existingItemIndex !== -1) {
    // Update existing item quantity
    this.items[existingItemIndex].quantity += itemData.quantity;
    console.log('🛒 [CART_MODEL] Updated existing item quantity:', {
      itemName: this.items[existingItemIndex].name,
      newQuantity: this.items[existingItemIndex].quantity
    });
  } else {
    // Add new item
    this.items.push({
      itemId: itemData.itemId,
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      quantity: itemData.quantity,
      image: itemData.image,
      category: itemData.category
    });
    console.log('🛒 [CART_MODEL] Added new item to cart:', itemData.name);
  }
  
  // Recalculate totals
  this.calculateTotals();
  return this.save();
};

// Method to update item quantity
cartSchema.methods.updateItemQuantity = function(itemId, newQuantity) {
  console.log('🛒 [CART_MODEL] Updating item quantity:', {
    cartId: this._id,
    itemId,
    newQuantity
  });
  
  const itemIndex = this.items.findIndex(item => 
    item.itemId.toString() === itemId.toString()
  );
  
  if (itemIndex === -1) {
    throw new Error('Item not found in cart');
  }
  
  if (newQuantity <= 0) {
    // Remove item
    this.items.splice(itemIndex, 1);
    console.log('🛒 [CART_MODEL] Removed item from cart');
  } else {
    // Update quantity
    this.items[itemIndex].quantity = newQuantity;
    console.log('🛒 [CART_MODEL] Updated item quantity:', {
      itemName: this.items[itemIndex].name,
      newQuantity
    });
  }
  
  // Recalculate totals
  this.calculateTotals();
  return this.save();
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  console.log('🛒 [CART_MODEL] Clearing cart:', this._id);
  this.items = [];
  this.subtotal = 0;
  this.total = 0;
  return this.save();
};

// Static method to find active cart for user and restaurant
cartSchema.statics.findActiveCart = function(userId, restaurantId) {
  console.log('🛒 [CART_MODEL] Finding active cart for user:', {
    userId,
    restaurantId
  });
  
  return this.findOne({
    userId,
    restaurantId
  });
};

// Pre-save middleware to calculate totals
cartSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.calculateTotals();
  }
  next();
});

module.exports = mongoose.model('Cart', cartSchema);
