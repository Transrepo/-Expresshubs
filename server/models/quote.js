const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const QuoteSchema = new Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },

  tel: {
    type: String,
    required: true
  },
  
  cargo: {
    type: String,
    required: true
  },
    
  orignCountry: {
    type: String,
    required: true
  },

  currentPlace: {
    type: String,
    required: true
  },
 
  destination: {
    type: String,
    required: true
  },
   
  quantity: {
    type: String,
    required: true
  },

  weight: {
    type: String,
    required: true
  }, 
  width: {
    type: String,
    required: true
  },

  height: {
    type: String,
    required: true
  },

  details: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  updatedAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Customer', QuoteSchema);