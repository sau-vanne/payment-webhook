require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// API to create order
app.post('/create-order', async (req, res) => {
  const options = {
    amount: 9900, // amount in smallest currency unit => ₹99 = 9900 paise
    currency: "INR",
    receipt: `receipt_order_${Math.floor(Math.random() * 10000)}`,
    payment_capture: 1,
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log(order);
    res.json(order); // Sending order details back to frontend
  } catch (error) {
    console.error(error);
    res.status(500).send("Something went wrong");
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
