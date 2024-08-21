const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

const shopifyCustomersSchema = new mongoose.Schema({}, { strict: false });
const shopifyOrdersSchema = new mongoose.Schema({}, { strict: false });

const ShopifyCustomer = mongoose.model(
  "ShopifyCustomer",
  shopifyCustomersSchema,
  "shopifyCustomers"
);
const ShopifyOrder = mongoose.model(
  "ShopifyOrder",
  shopifyOrdersSchema,
  "shopifyOrders"
);

function getGroupByInterval(interval) {
  console.log(`Received interval: ${interval}`);

  switch (interval) {
    case "daily":
      return { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } };
    case "monthly":
      return { $dateToString: { format: "%Y-%m", date: "$created_at" } };
    case "quarterly":
      return {
        $concat: [
          { $toString: { $year: "$created_at" } },
          "-Q",
          { $toString: { $ceil: { $divide: [{ $month: "$created_at" }, 3] } } },
        ],
      };
    case "yearly":
      return { $dateToString: { format: "%Y", date: "$created_at" } };
    default:
      console.log("Invalid interval provided.");
      return null;
  }
}

app.get("/api/sales-over-time", async (req, res) => {
  const interval = req.query.interval || "daily";
  const groupBy = getGroupByInterval(interval);

  if (!groupBy) {
    return res
      .status(400)
      .send(
        "Invalid interval. Valid intervals are: daily, monthly, quarterly, yearly."
      );
  }

  try {
    const salesData = await ShopifyOrder.aggregate([
      {
        $addFields: {
          created_at: {
            $cond: {
              if: { $ne: [{ $type: "$created_at" }, "date"] },
              then: { $toDate: "$created_at" },
              else: "$created_at",
            },
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalSales: {
            $sum: { $toDouble: "$total_price_set.shop_money.amount" },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(salesData);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).send(err.message);
  }
});

app.get("/api/sales-growth-rate", async (req, res) => {
  const interval = req.query.interval || "daily";
  const groupBy = getGroupByInterval(interval);

  if (!groupBy) {
    return res
      .status(400)
      .send(
        "Invalid interval. Valid intervals are: daily, monthly, quarterly, yearly."
      );
  }

  try {
    const salesData = await ShopifyOrder.aggregate([
      {
        $addFields: {
          created_at: {
            $cond: {
              if: { $ne: [{ $type: "$created_at" }, "date"] },
              then: { $toDate: "$created_at" },
              else: "$created_at",
            },
          },
        },
      },
      {
        $group: {
          _id: groupBy,
          totalSales: {
            $sum: { $toDouble: "$total_price_set.shop_money.amount" },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const growthRateData = salesData.map((data, index, arr) => {
      if (index === 0) return { ...data, growthRate: 0 };
      const previous = arr[index - 1];
      const growthRate =
        ((data.totalSales - previous.totalSales) / previous.totalSales) * 100;
      return { ...data, growthRate };
    });

    res.json(growthRateData);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).send(err.message);
  }
});

app.get("/api/new-customers-over-time", async (req, res) => {
  const interval = req.query.interval || "daily";
  const groupBy = getGroupByInterval(interval);

  if (!groupBy) {
    return res
      .status(400)
      .send(
        "Invalid interval. Valid intervals are: daily, monthly, quarterly, yearly."
      );
  }

  try {
    const customerData = await ShopifyCustomer.aggregate([
      {
        $addFields: {
          created_at: {
            $cond: {
              if: { $ne: [{ $type: "$created_at" }, "date"] },
              then: { $toDate: "$created_at" },
              else: "$created_at",
            },
          },
        },
      },
      { $group: { _id: groupBy, newCustomers: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(customerData);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).send(err.message);
  }
});

app.get("/api/repeat-customers", async (req, res) => {
  const interval = req.query.interval || "daily";
  const groupBy = getGroupByInterval(interval);

  if (!groupBy) {
    return res
      .status(400)
      .send(
        "Invalid interval. Valid intervals are: daily, monthly, quarterly, yearly."
      );
  }

  try {
    const repeatCustomersData = await ShopifyOrder.aggregate([
      {
        $addFields: {
          created_at: {
            $cond: {
              if: { $ne: [{ $type: "$created_at" }, "date"] },
              then: { $toDate: "$created_at" },
              else: "$created_at",
            },
          },
        },
      },
      {
        $group: {
          _id: { customerId: "$customer.id", groupBy },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
      { $group: { _id: "$_id.groupBy", repeatCustomers: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(repeatCustomersData);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).send(err.message);
  }
});

app.get("/api/customer-geography", async (req, res) => {
  try {
    const geoData = await ShopifyCustomer.aggregate([
      { $group: { _id: "$default_address.city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json(geoData);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).send(err.message);
  }
});

app.get("/api/customer-lifetime-value", async (req, res) => {
  try {
    const cohortData = await ShopifyCustomer.aggregate([
      {
        $lookup: {
          from: "shopifyOrders",
          localField: "id",
          foreignField: "customer.id",
          as: "orders",
        },
      },
      { $unwind: "$orders" },
      {
        $addFields: {
          "orders.created_at": {
            $cond: {
              if: { $ne: [{ $type: "$orders.created_at" }, "date"] },
              then: { $toDate: "$orders.created_at" },
              else: "$orders.created_at",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            cohort: {
              $dateToString: { format: "%Y-%m", date: "$orders.created_at" },
            },
            customerId: "$id",
          },
          totalValue: {
            $sum: { $toDouble: "$orders.total_price_set.shop_money.amount" },
          },
        },
      },
      { $group: { _id: "$_id.cohort", cohortValue: { $avg: "$totalValue" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(cohortData);
  } catch (err) {
    console.error("Aggregation error:", err);
    res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
