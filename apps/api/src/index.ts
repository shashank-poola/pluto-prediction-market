import express from "express";

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true
    });
)

app.use('/api', mainRouter);

app.listen(PORT, () => {
    console.log("server is running on PORT")
})