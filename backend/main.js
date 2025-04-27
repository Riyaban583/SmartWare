import express from "express";
import router from "./routes/index.js";
import cors from 'cors';
import { dbRouter } from "./db/db.js";

const app = express();
const port = process.env.PORT || 3022;

app.use(cors());
app.use(express.json());
app.use('/', router);
app.use('/' , dbRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});