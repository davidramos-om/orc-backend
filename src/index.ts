import express, { Request, Response, NextFunction } from "express";
import tesseract from "node-tesseract-ocr";
import cors from "cors";
import path from "path";

import { upload } from "./storage";

const app = express();
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  })
);

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

app.post("/upload", upload.single("image"), (req: Request, res: Response) => {
  const file = req.file?.filename;
  const lang = req.body.lang;
  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }

  const config = {
    lang: lang || "jpn", // Japanese characters
    oem: 1,
    psm: 3,
  };

  tesseract
    .recognize(`uploads/${file}`, config)
    .then((text) => {
      console.dir({ text });
      res.status(200).json(text);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json(err);
    });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.dir({
    step: "error handling middleware",
    err: err,
  });
  res.status(500).send(err.message);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
