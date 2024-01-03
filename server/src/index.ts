import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.listen(5174);

app.get("/main", (req: Request, res: Response) => {
  res.json({ field: "test GET, it works" });
});

app.post("/main", (req: Request, res: Response) => {
  console.log("test POST, it works");
  res.json({ field: "test POST, it works" });
});
