import app from "./app";
import "dotenv/config";

const port: number = 8000;
//running app
app.listen(port, () => {
  console.log(`[🔥API] Running in http://localhost:${port}/`);
});
