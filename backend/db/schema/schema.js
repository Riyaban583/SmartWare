import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/warehouse-db'
)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err)
);

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    volume: { type: Number },
    quantity: { type: Number, required: true },
    priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] , default: 'High' },
    lastAccessed: { type: Date },
    expirationDate: { type: Date },
    movable: { type: Boolean },
    fragility: { type: String, enum: ['High', 'Medium', 'Low'] }
});

const Item = mongoose.model('Item', itemSchema);

const inventorySchema = new mongoose.Schema({
    id: { type: Number },
    name: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, required: true },
    retrievalTime: { type: Number },
    distance: { type: Number, }, 
    expirationDate: { type: Date },
    priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
    lastUsed: { type: Date },
    dateAdded: { type: Date },
    quantity: { type: Number , required : true },
    description: { type: String }
});

const Inventory = mongoose.model("Inventory", inventorySchema);

export {
    Item , Inventory
}


// ;{ id: 1, name: 'Expired Medication', category: 'Pharmaceutical', volume: 0.5, container: 'Red Bin', status: 'pending' },
// { id: 2, name: 'Used Batteries', category: 'Electronic', volume: 0.8, container: 'E-waste Bin', status: 'pending' },
// { id: 3, name: 'Empty Food Container', category: 'Plastic', volume: 1.2, container: 'Recycling Bin', status: 'pending' },
// { id: 4, name: 'Old Newspaper', category: 'Paper', volume: 0.7, container: 'Paper Recycling', status: 'pending' },
// { id: 5, name: 'Broken Phone Charger', category: 'Electronic', volume: 0.3, container: 'E-waste Bin', status: 'pending' }