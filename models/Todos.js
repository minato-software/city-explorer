const mongoose = require('mongoose');
const { todoConnection } = require('../config/db');

// Step 1: Define the schema
const todoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        required: false
    }
});
// Step 2: Define the model by using the db connection to request the collection, passing the schema
const Todos = todoConnection.model('todos',todoSchema);
// Step 3: Export the model
module.exports = Todos;
