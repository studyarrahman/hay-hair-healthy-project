const authRoutes = require("./authRoutes");
const articleRoutes = require("./articleRoutes");
const recommendationRoutes = require("./recommendationRoutes");

require("dotenv").config();

module.exports = (app) => {
  app.use("/auth", authRoutes);
  app.use("/news", articleRoutes);
  app.use("/recommendations", recommendationRoutes);
};
