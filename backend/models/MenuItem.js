const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // Pizzas, Sushi, Burgers, Desserts, etc.
  status: { 
    type: String, 
    enum: ['in_stock', 'low_stock', 'out_of_stock'], 
    default: 'in_stock' 
  },
  stockLevel: { type: Number, default: 100 },
  tags: [{ type: String }], // Bestseller, Healthy, Vegan, Gluten Free
  rating: { type: Number, default: 4.5 },
  reviewsCount: { type: Number, default: 0 },
  ingredients: [{ type: String }],
  nutrition: {
    calories: { type: String, default: '350 kcal' },
    protein: { type: String, default: '12g' },
    carbs: { type: String, default: '45g' },
    fat: { type: String, default: '15g' }
  }
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
