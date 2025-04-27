import express from 'express';
import { Wharry } from '../chat/index.js';

const router = express.Router();


router.post('/api/chat', async (req, res) => {

    try {
        const { message } = req.body;
        const response = await Wharry(message);

        return res.status(200).json({
            response,
            ok : true
        })
    } catch (err) {

        return res.status(403).json({
            error: err.message,
            ok : false
        })

    }
})




export default router;