const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// GET /api/recipes - list recipes with optional filters
router.get('/', async (req, res) => {
  try {
    const { q, ingredient, maxTime, difficulty, favorites } = req.query;
    const filter = {};
    if (q) filter.title = { $regex: q, $options: 'i' };
    if (ingredient) filter.ingredients = { $in: [new RegExp(ingredient, 'i')] };
    if (maxTime) filter.time = { $lte: Number(maxTime) };
    if (difficulty) filter.difficulty = difficulty;
    if (favorites === 'true') filter.favorite = true;
    const recipes = await Recipe.find(filter).sort({ createdAt: -1 });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to list recipes', error: err.message });
  }
});

// POST /api/recipes - create
router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const recipe = new Recipe(data);
    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create recipe', error: err.message });
  }
});

// GET /api/recipes/:id - get by id
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching recipe', error: err.message });
  }
});

// PUT /api/recipes/:id - update
router.put('/:id', async (req, res) => {
  try {
    const updated = await Recipe.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update', error: err.message });
  }
});

// DELETE /api/recipes/:id - delete
router.delete('/:id', async (req, res) => {
  try {
    await Recipe.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed', error: err.message });
  }
});

// PUT /api/recipes/:id/favorite - toggle favorite
router.put('/:id/favorite', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Not found' });
    recipe.favorite = !recipe.favorite;
    await recipe.save();
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: 'Favorite toggle failed', error: err.message });
  }
});

module.exports = router;
