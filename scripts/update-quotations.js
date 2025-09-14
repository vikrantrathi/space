const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/your-database-name');
    // Debug log removed
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update existing quotations to add new fields
const updateQuotations = async () => {
  try {
    await connectDB();
    
    const Quotation = mongoose.model('Quotation', new mongoose.Schema({}, { strict: false }));
    
    // Update all quotations to add the new fields if they don't exist
    const result = await Quotation.updateMany(
      {
        $or: [
          { clientAddress: { $exists: false } },
          { country: { $exists: false } },
          { projectDeadline: { $exists: false } }
        ]
      },
      {
        $set: {
          clientAddress: '',
          country: '',
          projectDeadline: ''
        }
      }
    );
    
    // Debug log removed
    
    // Verify the update
    const quotations = await Quotation.find({}).limit(5);
    // Debug logs removed
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating quotations:', error);
    process.exit(1);
  }
};

updateQuotations();
