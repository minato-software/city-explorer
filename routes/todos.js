const express = require('express');
const router = express.Router();
const Todos = require('../models/Todos');
const app = require("../api/server");

// Get all todos
router.get('/', async (req, res) => {
    // Call the find function from a Todos model
    const todos = await Todos.find();
    // Response with the json data
    try {
        res.status(200).json({data: todos});
    } catch(err) {
        console.error(err);
        res.status(500).send('Error getting todos');
    }
})

// Add a new todo
router.post('/', async (req, res) => {
    const title = req.body.title;
    const completed = false;
    if(title) {
        const savedTodo = await Todos.create({
            "title": title,
            "completed": completed,
        });
        // The savedTodo should include an id from MongoDB
        res.status(200).json({success: true, data: savedTodo})
    } else {
        resp.status(400).json({success: false, message: 'Title is required'});
    }
});

// Update a todo
router.put('/:id', async (req, res) => {
   const id = req.params.id;
   if(!isValidId(id)) {
       console.error('Invalid ID format:', id);
       return res.status(400).send('Invalid ID format');
   }
   const todo = {
       "title": req.body.title,
       "completed": false,
   };
   const updatedTodo = await Todos.findByIdAndUpdate(id,{$set: todo}, {new: true});
   if(!updatedTodo) {
       return res.status(404).json({success: false, message: 'That todo could not be found'});
   }
   res.json({success: true, data: updatedTodo});
});


// Delete a todo
router.delete('/:id', async (req, res) => {
    const id = req.params.id;
    if(!isValidId(id)) {
        console.error('Invalid ID format:', id);
        return res.status(400).send('Invalid ID format');
    }
    const deletedTodo = await Todos.findByIdAndDelete(id);
    if(!deletedTodo) {
        return res.status(404).json({success: false, message: 'That todo could not be found'});
    }
    res.json({success: true, data: deletedTodo});
});


// Delete all todos
router.delete('', async (req, res) => {
    const result = await Todos.deleteMany({});
    return res.json({
        success: true,
        message: 'All todos deleted successfully',
        data: { deletedCount: result.deletedCount }
    });
})
//isValidID function
function isValidId(id) {
    if (
        (typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id)) ||  // 24-char hex string
        (id instanceof Uint8Array && id.length === 12) ||           // 12-byte Uint8Array
        (Number.isInteger(id))                                      // Integer
    ) {
        return true;
    }
    return false;
}
module.exports = router;