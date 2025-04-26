require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const bodyParser = require('body-parser');
const crypto = require('crypto');

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

// Webhook endpoint to receive Razorpay payment notifications
const razorpayWebhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const receivedData = req.body;
  const signature = req.headers['x-razorpay-signature'];

  // Verify webhook signature
  const expectedSignature = crypto.createHmac('sha256', razorpayWebhookSecret)
    .update(receivedData)
    .digest('hex');

  if (signature === expectedSignature) {
    // If the signature matches, process the payment
    const paymentEvent = JSON.parse(receivedData);
    
    if (paymentEvent.event === 'payment.success') {
      const paymentDetails = paymentEvent.payload.payment.entity;
      
      // Send a WhatsApp message (we'll handle this next)
      sendWhatsAppMessage(paymentDetails);
      
      return res.status(200).send('Payment successful');
    }
  } else {
    return res.status(400).send('Invalid signature');
  }
});

// Function to send WhatsApp message (for payment confirmation)
function sendWhatsAppMessage(paymentDetails) {
  const customerPhoneNumber = paymentDetails.contact;
  
  // Use an API like Twilio or any other service to send WhatsApp messages
  // Example using Twilio (you can choose your own service)
  // Send a message with payment confirmation
  console.log(`Sending WhatsApp confirmation to ${customerPhoneNumber}`);
}

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

