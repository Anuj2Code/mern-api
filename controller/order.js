const Order = require("../models/Order");
const Product = require("../models/Product");
const sendEmail = require("../utils/sendEmail");

const createOrder = async (req, res) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
  } = req.body;
  const order = new Order({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user: req.query.id,
  });
  const saved = await order.save();
  try {
    return res.status(200).json({
      data : saved,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const singleOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(400).json("Order not found with this id !");
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
// get logged user order
const myOrder = async (req, res) => {
  try {
    const order = await Order.find({ user: req.query.id });
    const count =  await Order.find().countDocuments();
    if (!order) {
      return res.status(400).json("Order not found with this id !");
    }
    return res.status(200).json({
      success: true,
      data:order,
      count:count
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const getAllOrder = async (req, res) => {
  try {
    const order = await Order.find();
    const OrderCount = await Order.find().countDocuments();
    let totalAmount = 0;

    order.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    return res.status(200).json({
      order,
      totalAmount,
      OrderCount
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};
//update order status --admin
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    console.log(order);
    if (!order) {
      return res.status(400).json("Order Not Found !");
    }
    if (order.orderStatus === "Delivered") {
      return res.status(400).json("We have already delivered the product");
    }
    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async(o) => {
        await updateStock(o.product, o.quantity);
      });
    }
    order.orderStatus = req.body.status;

    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }
    await order.save();
    res.status(200).json({
      success: true,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.Stock -= quantity;
  await product.save({ validateBeforeSave: false });
}

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    console.log(order);
    return res.status(200).json({
      success: true,
      message: "Deleted successfully !",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error,
    });
  }
};
const successOrder = async(req,res)=>{
   const message = `Congratulation \n\n Your order has been successfully placed `
   try {
    await sendEmail({
      email:req.query.email,
      subject: `Ecommerce Order confirmation`,
      message,
    })
    res.status(200).json({
      success: true,
      message: `Confirmation message sent to ${req.query.email} `,
    });
   } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
   }
  }
module.exports = {
  createOrder,
  singleOrder,
  myOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
  successOrder
};
