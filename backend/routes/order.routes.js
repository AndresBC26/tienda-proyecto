const express = require('express');
const router = express.Router();
// Aquí irían tus modelos y lógica de órdenes

router.get('/', (req, res) => {
    res.send('Ruta de órdenes funcionando');
});

module.exports = router;