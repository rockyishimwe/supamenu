"use client";
import React, { useState } from 'react';
import { useDineFlow } from '../../context';
import { 
  Menu as MenuIcon, Plus, Trash2, Edit, Check, AlertCircle, 
  Sparkles, Star, DollarSign, Tag, Info, ChefHat
} from 'lucide-react';

export default function OwnerMenuEditor() {
  const { menuItems, addMenuItem } = useDineFlow();
  
  // Filters
  const [activeCategory, setActiveCategory] = useState('All');
  
  // Add menu form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Pasta');
  const [stockLevel, setStockLevel] = useState(50);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400');
  const [tags, setTags] = useState('Popular');
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  const categories = ['All', ...new Set(menuItems.map(item => item.category))];

  const filteredItems = activeCategory === 'All'
    ? menuItems
    : menuItems.filter(item => item.category === activeCategory);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanPrice = parseFloat(price);
    if (isNaN(cleanPrice) || cleanPrice <= 0) return;

    await addMenuItem({
      name,
      description,
      price: cleanPrice,
      category,
      stockLevel: parseInt(stockLevel),
      image: imageUrl,
      tags: tags.split(',').map(t => t.trim())
    });

    setFormSuccess(true);
    setName('');
    setDescription('');
    setPrice('');
    setStockLevel(50);
    
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddForm(false);
    }, 2000);
  };

  return (
    <div className="p-8 space-y-8 bg-[#07090e] min-h-screen text-gray-300">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ChefHat className="w-5 h-5 text-[#FF6B00]" /> Menu Editor Catalog
          </h2>
          <p className="text-[11px] text-gray-500">Update dishes, adjust prices, edit descriptions and track active stock.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-[#FF6B00] hover:bg-[#e05e00] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-[#FF6B00]/10 hover-lift transition-all"
        >
          <Plus className="w-4 h-4" /> Add Food Item
        </button>
      </div>

      {/* Main split */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Left / Center: Menu Browsing */}
        <div className="lg:col-span-8 space-y-6">
          {/* Categories select */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border whitespace-nowrap transition-all ${
                  activeCategory === cat 
                    ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-md shadow-[#FF6B00]/15' 
                    : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {filteredItems.map(item => (
              <div 
                key={item._id}
                className="p-4 bg-[#0f1115] border border-white/5 rounded-3xl flex gap-4 hover:border-white/10 transition-all duration-300"
              >
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-24 h-24 rounded-2xl object-cover"
                />
                <div className="flex-1 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-white truncate max-w-[130px]">{item.name}</h4>
                      <span className="text-xs font-bold text-[#FF6B00]">${item.price}</span>
                    </div>
                    <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/5 text-[9px] text-gray-500">
                    <span>Stock: {item.stockLevel} units</span>
                    <span className="text-[#22C55E] uppercase font-bold tracking-wider text-[8px] bg-[#22C55E]/10 px-1.5 py-0.5 rounded">
                      {item.status || 'In Stock'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Pane: Add Form panel */}
        {showAddForm && (
          <div className="lg:col-span-4 bg-[#0f1115] border border-white/5 p-6 rounded-3xl space-y-6 animate-in fade-in duration-200">
            <div className="space-y-1.5 pb-4 border-b border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Create New Dish</h3>
              <p className="text-[10px] text-gray-500">Define price, description and stock counts.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Item Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required
                  placeholder="e.g. Garlic Truffle Fries"
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Price ($)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required
                    placeholder="0.00"
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase">Initial Stock</label>
                  <input 
                    type="number" 
                    value={stockLevel} 
                    onChange={(e) => setStockLevel(e.target.value)} 
                    required
                    className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Category Group</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white"
                >
                  <option value="Pasta" className="bg-[#0f1115]">Pasta</option>
                  <option value="Pizzas" className="bg-[#0f1115]">Pizzas</option>
                  <option value="Salads" className="bg-[#0f1115]">Salads</option>
                  <option value="Desserts" className="bg-[#0f1115]">Desserts</option>
                  <option value="Beverages" className="bg-[#0f1115]">Beverages</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase">Description Details</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required
                  placeholder="Ingredients, size, spice levels..."
                  rows="3"
                  className="w-full bg-white/5 border border-white/5 p-2.5 rounded-xl text-xs text-white focus:outline-none"
                />
              </div>

              {formSuccess && (
                <div className="bg-[#22C55E]/10 border border-[#22C55E]/20 p-3 rounded-xl text-center text-xs text-[#22C55E] flex items-center justify-center gap-1.5 font-semibold">
                  <Check className="w-4 h-4" /> Item added successfully!
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs rounded-xl shadow-lg shadow-[#FF6B00]/15"
              >
                Add Menu Item
              </button>
            </form>
          </div>
        )}

      </div>

    </div>
  );
}
