const mongoose = require('mongoose');

const MONGODB_URL =
  "mongodb+srv://karthimailu_db_user:Rma1zgLmDktUJ3yD@soulconnectcluster.uszzhth.mongodb.net/soul_connect_india";

async function inspect() {
  try {
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB!");
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    
    // Inspect customers collection
    const customers = await mongoose.connection.db.collection('customers').find({}).limit(5).toArray();
    console.log("Customers (first 5):", JSON.stringify(customers, null, 2));

    // Get indexes
    const indexes = await mongoose.connection.db.collection('customers').indexes();
    console.log("Indexes on customers:", JSON.stringify(indexes, null, 2));

    // Drop index keycloakId_1
    try {
      await mongoose.connection.db.collection('customers').dropIndex("keycloakId_1");
      console.log("Dropped keycloakId_1 index successfully!");
    } catch (e) {
      console.log("Index drop failed or index didn't exist:", e.message);
    }
    
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

inspect();
