const Quote = require("../models/quote");
const mongoose = require("mongoose");

/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => {
  // Remove
  // const messages = await req.consumeFlash('info');
  // Use this instead
  const messages = await req.flash("info");

  const locals = {
    title: "Expresshub Delivery Admin",
    description: "Expresshub Quotes Management System",
  };

  let perPage = 12;
  let page = req.query.page || 1;

  try {
    const quotes = await Quote.aggregate([{ $sort: { createdAt: -1 } }])
      .skip(perPage * page - perPage)
      .limit(perPage)
      .exec();
    // Count is deprecated. Use countDocuments({}) or estimatedDocumentCount()
    // const count = await Customer.count();
    const count = await Quote.countDocuments({});

    res.render("admin", {
      locals,
      quotes,
      current: page,
      pages: Math.ceil(count / perPage),
      messages,
    });
  } catch (error) {
    console.log(error);
  }
};
// exports.homepage = async (req, res) => {
//     const messages = await req.consumeFlash('info');
//     const locals = {
//       title: 'NodeJs',
//       description: 'Free NodeJs User Management System'
//     }

//     try {
//       const customers = await Customer.find({}).limit(22);
//       res.render('index', { locals, messages, customers } );
//     } catch (error) {
//       console.log(error);
//     }
// }

/**
 * GET /
 * About
 */
// exports.about = async (req, res) => {
//   const locals = {
//     title: "About",
//     description: "Free NodeJs User Management System",
//   };

//   try {
//     res.render("about", locals);
//   } catch (error) {
//     console.log(error);
//   }
// };

/**
 * GET /
 * New Customer Form
 */
exports.addCustomer = async (req, res) => {
  const locals = {
    title: "Add New Quote - Expresshub",
    description: "Expresshub Admin Management System",
  };

  res.render("admin/add", locals);
};

/**
 * POST /
 * Create New Customer
 */
exports.postCustomer = async (req, res) => {
  // console.log(req.body);

  const newQuote = new Quote({
    fullName: req.body.fullName,
    email: req.body.email,
    tel: req.body.tel,
    cargo: req.body.cargo,
    orignCountry: req.body.orignCountry,
    currentPlace: req.body.currentPlace,
    destination: req.body.destination,
    quantity: req.body.quantity,
    weight: req.body.weight,
    width: req.body.width,
    height: req.body.height,
    details: req.body.details,
  });

  try {
    await Quote.create(newQuote);
    await req.flash("info", "New delivery Quote has been added.");

    res.redirect("/adminRoutes");
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * 
 * 
 * Customer Data
 */
exports.view = async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id });

    const locals = {
      title: "View delivery Quote Data",
      description: "Expresshub Admin Management System",
    };

    res.render("admin/view", {
      locals,
      quote,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * Edit Customer Data
 */
exports.edit = async (req, res) => {
  try {
    const quote = await Quote.findOne({ _id: req.params.id });

    const locals = {
      title: "Edit Customer Delivery Data",
      description: "Free NodeJs User Management System",
    };

    res.render("admin/edit", {
      locals,
      quote,
    });
  } catch (error) {
    console.log(error);
  }
};

/**
 * GET /
 * Update Customer Data
 */
exports.editPost = async (req, res) => {
  try {
    await Quote.findByIdAndUpdate(req.params.id, {
        fullName: req.body.fullName,
        email: req.body.email,
        tel: req.body.tel,
        cargo: req.body.cargo,
        orignCountry: req.body.orignCountry,
        currentPlace: req.body.currentPlace,
        destination: req.body.destination,
        quantity: req.body.quantity,
        weight: req.body.weight,
        width: req.body.width,
        height: req.body.height,
        details: req.body.details,
      updatedAt: Date.now(),
    });
    await res.redirect(`/edit/${req.params.id}`);

    console.log("redirected");
  } catch (error) {
    console.log(error);
  }
};

/**
 * Delete /
 * Delete Customer Data
 */
exports.deleteCustomer = async (req, res) => {
  try {
    await Quote.deleteOne({ _id: req.params.id });
    res.redirect("/adminRoutes");
  } catch (error) {
    console.log(error);
  }
};

/**
 * Get /
 * Search Customer Data
 */
exports.searchCustomers = async (req, res) => {
  const locals = {
    title: "Search Delivery Data",
    description: "Expresshub Admin Management System",
  };

  try {
    let searchTerm = req.body.searchTerm;
    const searchNoSpecialChar = searchTerm.replace(/[^a-zA-Z0-9 ]/g, "");

    const quotes = await Quote.find({
      $or: [
        { fullName: { $regex: new RegExp(searchNoSpecialChar, "i") } },
      ],
    });

    res.render("search", {
    quotes,
      locals,
    });
  } catch (error) {
    console.log(error);
  }
};
