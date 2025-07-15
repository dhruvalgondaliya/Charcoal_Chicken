import mongoose from 'mongoose';
import addOnSchema from '../Models/AddOne.js';

const variantSchema = new mongoose.Schema({
  size: {
    type: String,
    enum: ['Small', 'Medium', 'Large'],
    required: false
  },
  basePrice: {
    type: Number,
    required: true
  },
  addOns: [addOnSchema]
},{
  versionKey:false
});

export default variantSchema;
