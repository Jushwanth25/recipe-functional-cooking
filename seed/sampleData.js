// Seed script to populate the database with sample recipes
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Recipe = require('../models/Recipe');

const samples = [
  {
    title: 'Classic Pancakes',
    ingredients: ['Flour', 'Milk', 'Egg', 'Baking Powder', 'Salt', 'Butter'],
    steps: ['Mix dry ingredients', 'Whisk wet ingredients', 'Cook on skillet 2-3 min each side'],
    time: 20,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=60',
    favorite: true
  },
  {
    title: 'Spicy Chickpea Curry',
    ingredients: ['Chickpeas', 'Tomato', 'Onion', 'Garlic', 'Curry Powder', 'Coconut Milk'],
    steps: ['Sauté onion and garlic', 'Add spices', 'Add chickpeas and tomato', 'Simmer with coconut milk'],
    time: 35,
    difficulty: 'Medium',
    image: 'https://images.unsplash.com/photo-1604908814754-1c22f4d1d4b8?auto=format&fit=crop&w=800&q=60'
  },
  {
    title: 'Quick Avocado Toast',
    ingredients: ['Bread', 'Avocado', 'Lemon', 'Salt', 'Pepper'],
    steps: ['Toast bread', 'Mash avocado with lemon and seasoning', 'Spread and serve'],
    time: 10,
    difficulty: 'Easy',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=60'
  }
];

const seed = async () => {
  await connectDB();
  try {
    await Recipe.deleteMany({});
    await Recipe.insertMany(samples);
    console.log('Sample data inserted');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
