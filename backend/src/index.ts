import express from "express";
import userRoute from "./routes/user.ts";
import workerRoute from "./routes/worker.ts";

const app = express();

app.use(express.json());

app.use("/v1/user", userRoute);
app.use("/v1/worker", workerRoute);

app.get("/", (req, res) => {
  res.status(200).json({ msg: "Server is running" });
});

app.listen(4000, () => {
  console.log("Server Started");
});
