import express from "express";
import userRoute from "./routes/user.js";
import workerRoute from "./routes/worker.js";
const app = express();
app.use("/v1/user", userRoute);
app.use("/v1/worker", workerRoute);
app.get("/", (req, res) => {
    res.status(200).json({ msg: "Server is running" });
});
app.listen(4000, () => {
    console.log("Server Started");
});
//# sourceMappingURL=index.js.map