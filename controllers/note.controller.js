const Note = require("../models/note.model");
const User = require("../models/user.model");

async function getNotes(req, res) {
  const params = {
    name: req.query.name,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    inStock: req.query.inStock,
    page: req.query.page,
    limit: req.query.limit,
    categories: req.query.categories,
  };

  try {
    const filteredProducts = await filterByParams(params);
    res.status(200).json(filteredProducts);
  } catch (error) {
    console.log(
      "product.controller, getProducts. Error while getting products",
      error
    );
    res.status(500).json({ message: error.message });
  }
}

async function filterByParams(req, res) {
  const {
    name,
    minPrice,
    maxPrice,
    inStock,
    page = 1,
    limit = 10,
    categories,
  } = req;
  let query = {};
  if (name && typeof name === "string") {
    query.name = { $regex: name.trim(), $options: "i" };
  }

  if (minPrice !== undefined && maxPrice !== undefined) {
    const minPriceNum = parseFloat(minPrice);
    const maxPriceNum = parseFloat(maxPrice);

    if (!isNaN(minPriceNum) && !isNaN(maxPriceNum)) {
      query.price = { $gte: minPriceNum, $lte: maxPriceNum };
    }
  } else if (minPrice !== undefined) {
    const minPriceNum = parseFloat(minPrice);
    if (!isNaN(minPriceNum)) {
      query.price = { $gte: minPriceNum };
    }
  } else if (maxPrice !== undefined) {
    const maxPriceNum = parseFloat(maxPrice);
    if (!isNaN(maxPriceNum)) {
      query.price = { $lte: maxPriceNum };
    }
  }

  if (inStock !== undefined) {
    const inStockBool = inStock === "true" || inStock === true;
    const inStockNum = parseInt(inStock, 10);

    if (
      typeof inStockBool === "boolean" ||
      inStockNum === 0 ||
      inStockNum === 1
    ) {
      query.quantity = inStockBool ? { $gt: 0 } : { $eq: 0 };
    }
  }

  if (categories) {
    const categoriesArray = categories.split(",");
    query.categories = {
      $in: categoriesArray.map((cat) => new RegExp(cat, "i")),
    };
  }
  // Calculate the number of documents to skip
  const skip = (page - 1) * limit;
  try {
    const products = await Product.find(query).skip(skip).limit(limit);
    const total = await Product.countDocuments(query);
    const productsCategories = await Product.distinct("categories");
    return {
      products,
      total,
      page,
      pages: Math.ceil(total / limit),
      categories: productsCategories,
    };
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while filtering products" });
  }
}

async function getNoteById(req, res) {
  let note = null;
  try {
    const { id } = req.params;
    note = await Note.findById(id).exec();
    res.status(200).json(note);
  } catch (error) {
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function deleteNote(req, res) {
  let product = null;
  try {
    const { id } = req.params;
    product = await Product.findByIdAndDelete(id).exec();
    res.status(200).json({ message: "Product was deleted" });
  } catch (error) {
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function createNote(req, res) {
  const { name, price, quantity, categories, user } = req.body;
  const newProduct = new Product({
    name,
    price,
    quantity,
    categories,
    image: "https://picsum.photos/200/300?random=1",
    user,
  });

  try {
    const savedProduct = await newProduct.save();
    // Update the user's product array
    await User.findByIdAndUpdate(
      user,
      { $push: { products: savedProduct._id } },
      { new: true, useFindAndModify: false }
    );
    res
      .status(201)
      .json({ message: "Product created successfully", savedProduct });
  } catch (error) {
    console.log(
      "product.controller, createProduct. Error while creating product",
      error
    );
    if (error.name === "ValidationError") {
      console.log(`product.controller, createProduct. ${error.message}`);
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Server error while creating product" });
    }
  }
}

async function editNote(req, res) {
  let product = null;
  try {
    const { id } = req.params;
    const { name, price, quantity, categories, user } = req.body;
    product = await Product.findByIdAndUpdate(
      id,
      { name, price, categories, quantity, user },
      { new: true, runValidators: true }
    );
    res.status(200).json({ message: "Product was updated" });
  } catch (error) {
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(500).json({ message: error.message });
  }
}

async function getUserNotes(req, res) {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).populate("notes");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ notes: user.notes });
  } catch (error) {
    console.error("Error fetching user notes:", error);
    res.status(500).json({ message: "Server error while fetching user notes" });
  }
}

async function getDummyNotes(req, res) {
  try {
    const someDummyNotes = await Note.find({}).limit(5); //first 5 are dummies and not belong to any users
    res.status(200).json({ someDummyNotes });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred while filtering notes" });
  }
}

module.exports = {
  getNoteById,
  deleteNote,
  createNote,
  editNote,
  getUserNotes,
  getDummyNotes,
};
