const express = require("express");

const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const errorMiddleware = require("./error.middleware");
const notFoundMiddleware = require("./404.middleware");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("src/docs/swagger.yaml");

module.exports.applyMiddlewares = (app) => {
  app.use(cors());
  app.disable("x-powered-by");

  app.use(express.static("public"));

  if (process.env.NODE_ENV !== "production") {
    app.use(
      "auth/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerDocument, {
        customCss: ".swagger-ui .topbar { display: none }",
        customSiteTitle: `Greenpad Docs`,
        customfavIcon: "/images/favicon.png",
      })
    );
  }

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    morgan(":method :url :status :res[content-length] - :response-time ms")
  );
};

module.exports.applyErrorMdiddlewares = (app) => {
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);
};
