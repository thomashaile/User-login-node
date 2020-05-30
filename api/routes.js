const handlers = require('./handlers.js');
const express = require('express');

const router = express.Router();

router.get('/users', handlers.readAll);
router.get('/users/:id', handlers.readOne);
router.post('/users', handlers.create);
router.put('/users/:id', handlers.update);
router.delete('/users/:id', handlers.delete);

module.exports = router;