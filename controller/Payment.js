const stripe = require("stripe")('sk_test_51Op53OSHodQlhd6Iqempd5VO3hwgo3T2TS536yHiqqeq6liIK7P3jFGtCZast7FUGVOASozyTtlVC2Xdfy0dZbgP00pIwD7QhF');

const processPayment = async(req,res)=>{
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "inr",
        metadata: {
          company: "Ecommerce",
        },
      });
    
      res.status(200).json({ 
        success: true,
       client_secret: myPayment.client_secret 
      });
}
const sendStripeApiKey = async (req, res) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
  };

module.exports = {processPayment,sendStripeApiKey}
// 4000003560000008