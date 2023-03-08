// CRUD endpoints

import Express from "express";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkBlogPostsSchema, triggerBadRequest } from "../validation.js";

const blogPostsRouter = Express.Router();

const blogPostsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "blogPosts.json"
);

const getBlogPosts = () => JSON.parse(fs.readFileSync(blogPostsJSONPath));

const writeBlogPosts = (blogPostsArray) =>
  fs.writeFileSync(blogPostsJSONPath, JSON.stringify(blogPostsArray));

// POST (new blog post)

blogPostsRouter.post(
  "/",
  checkBlogPostsSchema,
  triggerBadRequest,
  (req, res, next) => {
    try {
      const newBlogPost = {
        ...req.body,
        createdAt: new Date(),
        id: uniqid(),
      };
      const blogPostsArray = getBlogPosts();
      blogPostsArray.push(newBlogPost);
      writeBlogPosts(blogPostsArray);
      res.status(201).send({ id: newBlogPost.id });
    } catch (error) {
      next(error);
    }
  }
);

// GET (all blogPosts)

blogPostsRouter.get("/", (req, res, next) => {
  try {
    const blogPostsArray = getBlogPosts();
    res.send(blogPostsArray);
  } catch (error) {
    next(error);
  }
});

// GET (single blogPost)

blogPostsRouter.get("/:blogPostId", (req, res, next) => {
  try {
    const blogPostsArray = getBlogPosts();
    const foundBlogPost = blogPostsArray.find(
      (foundBlogPost) => blogPost.id === req.params.blogPostId
    );
    if (foundBlogPost) {
      res.send(blogPost);
    } else {
      next(
        createHttpError(
          404,
          `There is no blogpost with ${req.params.blogPostId} as an ID`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

blogPostsRouter.put(
  "/:blogPostId",
  checkBlogPostsSchema,
  triggerBadRequest,
  (req, res, next) => {
    try {
      const blogPostsArray = getBlogPosts();

      const index = blogPostsArray.findIndex(
        (blogPost) => blogPost.id === req.params.blogPostId
      );

      if (index !== -1) {
        const oldBlogPost = blogPostsArray[index];
        const updatedBlogPost = {
          ...oldBlogPost,
          ...req.body,
          updatedAt: new Date(),
        };
        blogPostsArray[index] = updatedBlogPost;
        writeBlogPosts(blogPostsArray);
        res.send(updatedBlogPost);
      } else {
        next(
          createHttpError(
            404,
            `There is no blogpost with ${req.params.blogPostId} as an ID`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// DELETE

blogPostsRouter.delete("/:blogPostId", (req, res, next) => {
  try {
    const blogPostsArray = getBlogPosts();

    const remainingBlogPosts = blogPostsArray.filter(
      (blogPost) => blogPost.id !== req.params.blogPostId
    );

    if (blogPostsArray.length !== remainingBlogPosts.length) {
      writeBlogPosts(blogPostsArray);
      res.status(204).send();
    } else {
      next(
        createHttpError(
          404,
          `There is no blogpost with ${req.params.blogPostId} as an ID`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default blogPostsRouter;
