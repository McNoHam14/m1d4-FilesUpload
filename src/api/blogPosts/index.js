// CRUD endpoints

import Express from "express";
import fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkBlogPostsSchema, triggerBadRequest } from "../validation.js";
import { getBlogPosts, writeBlogPosts } from "../../lib/fs-tools.js";

const blogPostsRouter = Express.Router();

console.log(getBlogPosts());

// POST (new blog post)

blogPostsRouter.post(
  "/",
  checkBlogPostsSchema,
  triggerBadRequest,
  async (req, res, next) => {
    const newBlogPost = {
      ...req.body,
      id: uniqid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const blogPostsArray = await getBlogPosts();
    blogPostsArray.push(newBlogPost);
    await writeBlogPosts(blogPostsArray);
    res.status(201).send({ id: newBlogPost.id });
  }
);

// GET (all blogPosts)

blogPostsRouter.get("/", async (req, res, next) => {
  try {
    const blogPosts = await getBlogPosts();
    res.send(blogPosts);
  } catch (error) {
    next(error);
  }
});

// GET (single blogPost)

blogPostsRouter.get("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostsArray = await getBlogPosts();
    const blogPost = blogPostsArray.find(
      (blogPost) => blogPost.id === req.params.blogPostId
    );
    if (blogPost) {
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
  async (req, res, next) => {
    try {
      const blogPostsArray = await getBlogPosts();

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
        await writeBlogPosts(blogPostsArray);
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

blogPostsRouter.delete("/:blogPostId", async (req, res, next) => {
  try {
    const blogPostsArray = await getBlogPosts();

    const remainingBlogPosts = blogPostsArray.filter(
      (blogPost) => blogPost.id !== req.params.blogPostId
    );

    if (blogPostsArray.length !== remainingBlogPosts.length) {
      await writeBlogPosts(remainingBlogPosts);
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
