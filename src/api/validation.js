import { checkSchema, validationResult } from "express-validator";
import createHttpError, { HttpError } from "http-errors";

const authorsSchema = {
  name: {
    in: ["body"],
    isString: {
      errorMessage: "Needs to be a string",
    },
  },
  surname: {
    in: ["body"],
    isString: {
      errorMessage: "Needs to be a string",
    },
  },
  email: {
    in: ["body"],
    isString: {
      errorMessage: "Needs to be a string",
    },
  },
  DoB: {
    in: ["body"],
    isDate: {
      errorMessage: "Needs to be a date",
    },
  },
  avatar: {
    in: ["body"],
    isURL: {
      errorMessage: "Needs to be a valid image url",
    },
  },
};

const blogPostsSchema = {
  category: {
    in: ["body"],
    isString: {
      errorMessage: "Needs to be a string",
    },
  },
  title: {
    in: ["body"],
    isString: {
      errorMessage: "Needs to be a string",
    },
  },
  cover: {
    in: ["body"],
    isURL: {
      errorMessage: "Needs to be a valid image url",
    },
  },
  "readTime.value": {
    in: ["body"],
    isInt: {
      errorMessage: "Needs to be an integer",
    },
  },
  "readTime.unit": {
    in: ["body"],
    isString: {
      errorMessage: "Needs to be a string",
    },
  },
  content: {
    in: ["body"],
    isString: {
      errorMessage: "Needs to be a string",
    },
  },
};

export const checkAuthorsSchema = checkSchema(authorsSchema);
export const checkBlogPostsSchema = checkSchema(blogPostsSchema);

export const triggerBadRequest = (req, res, next) => {
  const errors = validationResult(req);

  console.log(errors.array());

  if (errors.isEmpty()) {
    next();
  } else {
    next(
      createHttpError(400, "Error during author validation", {
        errorsList: errors.array(),
      })
    );
  }
};
