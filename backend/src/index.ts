import { config } from "./config.js";
import { connectDb } from "./db.js";
import { createApp } from "./app.js";

const app = createApp();
await connectDb(config.mongoUri);
app.listen(config.port, () => {
  console.log(`classroom-api listening on http://127.0.0.1:${config.port}`);
});
