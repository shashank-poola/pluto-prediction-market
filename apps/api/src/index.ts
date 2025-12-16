import express from "express";
import cors from "cors";
import { router } from "./routes/auth.routes.js";

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ["http://localhost:3000"];

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true
    })
);

app.use('/api', router);

app.listen(PORT, () => {
    console.log(`Server is running on PORT ${PORT}`);
});