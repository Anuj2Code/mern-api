const Product = require("../models/Product");
const cloudinary = require('cloudinary').v2


const createProduct = async (req, res, next) => {
  let images = [];
  if (typeof req.body.images === "string") {
    images.push(req.body.images);
  } else {
    images = req.body.images;
  }

  const imagesLinks = [];

  for (let i = 0; i < images.length; i++) {
    const result = await cloudinary.uploader.upload(images[i], {
      folder: "products",
    });

    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }

  req.body.images = imagesLinks;
  req.body.user = req.query.id;
  const product = new Product(req.body);
  const saved = await product.save();
  try {
    res.status(200).json({
      success:true,
      saved,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};
const getAllProduct = async (req, res, next) => {
  try {
 const perPage = 8
    const { keyword, min, max, category } = req.query;
    console.log(min,max,category);
    const { page } = req.query || 1;
    if(min>0 && max<25000  ){
      const prod = await Product.find({
        $and: [{ name: { $regex: keyword, $options: "i" } },{price:{$lt:max }},{price:{$gt:min }}],
      })
        .skip((page - 1) * perPage)
        .limit(perPage);
        console.log(prod,'gdi');
        const productsCount = await Product.countDocuments();
        res.status(200).json({
          prod,
          productsCount,
          perPage
        });
    }
    else if(category!=='' && keyword==='' && min==='' && max===''){
      const prod = await Product.find({
        $or: [{
          category: {
            $regex: category,
            $options: "i",
          },
        }],
      })
        .skip((page - 1) * perPage)
        .limit(perPage);
        const productsCount = await Product.countDocuments();
        res.status(200).json({
          prod,
          productsCount,
          perPage,
        });
    }
    else{
      const prod = await Product.find({
        $or: [{ name: { $regex: keyword, $options: "i" } }],
      })
        .skip((page - 1) * perPage)
        .limit(perPage);
        const productsCount = await Product.countDocuments();
        res.status(200).json({
          prod,
          productsCount,
          perPage,
        });
       
    }
  } catch (error) {
    return res.status(500).json(error);
  }
};
//  const getDeal = async(req,res)=>{
//    try {
//     const pro = await Product.find().skip(10).limit(5)
//     res.status(200).json({
//       pro
//     })
//    } catch (error) {
//     return res.status(500).json(error);
//    }
//  }

const updateProduct = async (req, res, next) => {
  try {
    const update = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json({
      success:true,
      update
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const deletePro = async (req, res, next) => {
  try {
  const prod = await Product.findByIdAndDelete(req.params.id);
    for (let i = 0; i < prod.images.length; i++) {
      await cloudinary.uploader.destroy(prod.images[i].public_id);
    }
    return res.status(200).json({
      success: true,
      message: "Delete ho gaya",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
};

const getPro = async (req, res, next) => {
  try {
    const data = await Product.findById(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const filter = async (req, res) => {
  try {
    const { category } = req.query;
    console.log(category);
    const data = await Product.find({
      category: {
        $regex: category,
        $options: "i",
      },
    });
    res.status(200).json(data);
  } catch (error) {
    return res.status(500).json(error);
  }
};

const createReview = async (req, res) => {
  try {
    const { comment, rating, productID } = req.body;
    const review = {
      user: req.query.id,
      name: req.query.username,
      rating: Number(rating),
      comment: comment,
    };
    console.log(review);
    const product = await Product.findById(productID);

    const isReviewed = product.reviews.find(
      (rev) => rev.user.toString() === req.query.id.toString()
    );
    console.log(isReviewed);
    if (isReviewed) {
      product.reviews.forEach((rev) => {
        if (rev.user.toString() === req.query.id) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      console.log(product.reviews);
      product.numOfReviews = product.reviews.length;
    }
    let avg = 0;
    product.reviews.forEach((rev) => {
      avg += rev.rating;
    });
    console.log(avg);
    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });
    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
};

const getAllReiview = async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "product not found !",
      });
    }
    return res.status(200).json({
      success: true,
      message: product.reviews,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.query.ProductID);
    console.log(product);
    if (!product) {
      return res.status(400).json({
        success: false,
        message: "product not found !",
      });
    }
    const reviews = product.reviews.filter(
      (rev) => rev.user.toString() !== req.query.id.toString()
    );
    let avg = 0;
    reviews.forEach((rev) => {
      avg += rev.rating;
    });
    let ratings = 0;
    if (reviews.length == 0) {
      ratings = 0;
    } else {
      ratings = avg / reviews.length;
    }
    const numOfReviews = reviews.length;
    await Product.findByIdAndUpdate(
      req.query.ProductID,
      {
        reviews,
        ratings,
        numOfReviews,
      },
      {
        new: true,
      }
    );
    return res.status(200).json({
      success:true,
    });
  } catch (error) {
    return res.status(400).json(error);
  }
};

const getAllProducts = async(req,res)=>{
  const prod = await Product.find();
  res.status(200).json({
    success:true,
    prod
  })
}
module.exports = {
  createProduct,
  getAllProduct,
  updateProduct,
  deletePro,
  getPro,
  filter,
  createReview,
  deleteReview,
  getAllReiview,
  getAllProducts,
  // getDeal
};
