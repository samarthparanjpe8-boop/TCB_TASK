import { config } from "./config.js";
import { connectDb } from "./db.js";
import { createApp } from "./app.js";

const app = createApp();
await connectDb(config.mongoUri);
app.listen(config.port, "0.0.0.0", () => {
  console.log(`classroom-api listening on http://0.0.0.0:${config.port}`);
});
