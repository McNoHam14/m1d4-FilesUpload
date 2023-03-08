import Express from "express";
import listEndpoints from "express-list-endpoints";
import authorsRouter from "./api/authors/index.js";
import blogPostsRouter from "./api/blogPosts/index.js";
import {
  badRequestHandler,
  unauthorizedHandler,
  notfoundHandler,
  genericErrorHandler,
} from "./errorHandlers.js";
import cors from "cors";

const server = Express();
const port = 3002;

server.use(cors());

server.use(Express.json());

// Endpoints

server.use("/authors", authorsRouter);
server.use("/blogPosts", blogPostsRouter);

// Error handlers

server.use(badRequestHandler); // 400
server.use(unauthorizedHandler); // 401
server.use(notfoundHandler); // 404
server.use(genericErrorHandler); // 500

server.listen(port, () => {
  console.table(listEndpoints(server));
  console.log(`Server is running on ${port}`);
});
