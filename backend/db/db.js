import express from "express";

import {Item , Inventory} from "./schema/schema.js";

const dbRouter = express.Router();

dbRouter.use(express.json());

dbRouter.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


dbRouter.get('/api/findItem' , async (req, res) => {
  try {
    const { name } = req.body;
    const item = await Item.findOne({ name });

    return res.status(200).json({
      item,
      ok : true
    })

}catch(err){

  return res.status(403).json({
    err,
    message : err.message
  })

}})

// Get optimized item layout
dbRouter.get('/api/optimize', async (req, res) => {
  try {
    // Sort items by priority (descending)
    const items = await Item.find().sort({ priority: -1 });
    
    // Basic optimization algorithm
    // In a real implementation, you'd have more sophisticated logic here
    const optimizedLayout = {
      highPriority: items.filter(item => item.priority > 7),
      mediumPriority: items.filter(item => item.priority > 3 && item.priority <= 7),
      lowPriority: items.filter(item => item.priority <= 3)
    };
    
    res.json(optimizedLayout);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new item
dbRouter.post('/api/items', async (req, res) => {
  try {
    const item = req.body;
    const newItem = await Item.create(item);  // name , category , quantity , location
    return res.status(201).json(newItem);
  } catch(err) {
    return res.status(403).json({
      err,
      message : err.message
    })
  }
});

// Update an item
dbRouter.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an item
dbRouter.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Chatbot query endpoint
dbRouter.post('/api/chatbot/query', async (req, res) => {
  const { query } = req.body;
  
  try {
    let response = "I couldn't understand that query";
    
    // Simple pattern matching for the chatbot
    if (query.toLowerCase().includes('highest priority')) {
      const highestPriorityItem = await Item.findOne().sort({ priority: -1 });
      response = `The highest priority item is ${highestPriorityItem.name} with priority level ${highestPriorityItem.priority}`;
    } else if (query.toLowerCase().includes('find') || query.toLowerCase().includes('where')) {
      // Extract item name from query (very basic extraction)
      const itemNames = await Item.distinct('name');
      const foundItemName = itemNames.find(name => query.toLowerCase().includes(name.toLowerCase()));
      
      if (foundItemName) {
        const item = await Item.findOne({ name: new RegExp(foundItemName, 'i') });
        response = `${item.name} is located at ${item.location}`;
      } else {
        response = "I couldn't find that item in our database";
      }
    }
    
    res.json({ response });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

dbRouter.get('/api/items/search', async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Missing item name in query' });
    }

    // Find the first item that matches the name (case-insensitive, partial)
    const item = await Item.findOne({ name: { $regex: name, $options: 'i' } });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({
      id: item._id,
      name: item.name,
      location: item.location,
      status: item.status,
      quantity: item.quantity,
      priority: item.priority || 'normal'
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export {
  dbRouter
};