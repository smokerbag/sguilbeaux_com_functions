import serverless from 'serverless-http';
import express, { Router } from 'express';
import mongoose from 'mongoose';

// Database connection
let isConnected = false;

const connectDb = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(Netlify.env.get('MONGODB_URI'));
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err);
    throw err;
  }
};

// Database schemas and models
const MagicCollectionSchema = new mongoose.Schema({
  total: {
    type: 'Number',
    required: true
  },
  totalUnique: {
    type: 'Number',
    required: true
  },
  value: {
    type: 'Number',
    required: true
  },
  updated: {
    type: 'Date',
    required: true
  }
});
const MagicCollection = mongoose.models.MagicCollection || mongoose.model('MagicCollection', MagicCollectionSchema, 'magicCollection');

const MagicCardSchema = new mongoose.Schema({
});
const MagicCard = mongoose.models.MagicCard || mongoose.model('MagicCard', MagicCardSchema, 'magicCards');

// Create app
const api = express();

// Middleware
api.use(express.json());

// Routing
const router = Router();

router.get('/mtg/cards', async (req, res) => {
  await connectDb();

  const collection = await MagicCollection.findOne({});

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 25;
  const skip = (page - 1) * limit;

  const cards = await MagicCard.find({}).skip(skip).limit(limit);

  const data = {
    total: collection.total,
    totalUnique: collection.totalUnique,
    value: collection.value,
    updated: collection.updated,
    page: page,
    limit: limit,
    skip: skip,
    cardCount: cards.length,
    cards: cards
  };
  res.send(data);
});

api.use('/api/', router);


export const handler = serverless(api);
