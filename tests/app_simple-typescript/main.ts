import { getDateString } from "./mod";
import express from "express";

const app = express();

app.get("/", (_, res) => {
  res.send("Hello world!");
});

app.get("/date", (_, res) => {
  res.send(getDateString());
});

app.listen(3000);
