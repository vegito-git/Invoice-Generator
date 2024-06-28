const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const PORT = process.env.PORT || 4000;

mongoose.connect(process.env.MONGODB_URL);
mongoose.connection.on('connected', async () => {
  console.log("DB Connected...");
  await clearCollection(); //Clear model at startup....
});
mongoose.connection.on('error', (error) => {
  console.log("Error while connecting to the database");
});

app.use(cors());
app.use(express.json());

require('./models/invoice_model');

app.use(require('./routes/invoice_route'));

app.listen(PORT, () => {
  console.log("Server has started...");
});

const InvoiceModel = mongoose.model("InvoiceModel");

async function clearCollection() {
  try {
    await InvoiceModel.deleteMany({});
    console.log('Collection cleared at startup.');
  } catch (err) {
    console.error('Error clearing collection:', err);
  }
}