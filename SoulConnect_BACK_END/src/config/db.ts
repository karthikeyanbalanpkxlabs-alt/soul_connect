import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { Customers } from "../models/customer";

const MONGODB_URL =
  process.env.MONGODB_URL ||
  "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";

// Seeding function from sample_customer.json if database is empty
const seedCustomers = async () => {
  try {
    const count = await Customers.countDocuments();
    if (count === 0) {
      console.log(
        "🌱 Customers collection is empty. Seeding from sample_customer.json...",
      );
      const pathsToTry = [
        path.join(__dirname, "sample_customer.json"),
        path.join(__dirname, "../sample_customer.json"),
        path.join(__dirname, "../../src/sample_customer.json"),
        path.join(__dirname, "../src/sample_customer.json"),
        path.join(process.cwd(), "src/sample_customer.json"),
        path.join(process.cwd(), "sample_customer.json"),
        path.join(process.cwd(), "SoulConnect_BACK_END/src/sample_customer.json"),
      ];
      let filePath = "";
      for (const p of pathsToTry) {
        if (fs.existsSync(p)) {
          filePath = p;
          break;
        }
      }
      if (filePath) {
        const rawData = fs.readFileSync(filePath, "utf-8");
        const sampleData = JSON.parse(rawData);
        const processedData = sampleData.map((cust: any) => {
          if (cust._id && cust._id.$oid) {
            cust._id = new mongoose.Types.ObjectId(cust._id.$oid);
          }
          return cust;
        });
        await Customers.insertMany(processedData);
        console.log(
          `✅ Successfully seeded ${processedData.length} customers!`,
        );
      } else {
        console.warn(
          "⚠️ Seed file sample_customer.json not found in search paths.",
        );
      }
    }
  } catch (err) {
    console.error("❌ Failed to seed customers:", err);
  }
};

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URL, { dbName: "soul_connect_india" });
    console.log(
      "✅ Successfully connected to MongoDB Atlas (soul_connect_india)",
    );
    await seedCustomers();
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};
