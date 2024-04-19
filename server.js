import app from "./app.js";
import mongoose from 'mongoose';
import 'dotenv/config';

const PORT = process.env.PORT || 3000;
const uriDb = process.env.DB_HOST;

const connection = mongoose.connect(uriDb);

async function startServer() {
  try {
    await connection;
    app.listen(PORT, function () {
      console.log(`Database connection successful`);
    })
  }
  catch(err) {
    console.log(`Server not running. Error message: ${err.message}`);
    process.exit(1);
  };
}
startServer();
