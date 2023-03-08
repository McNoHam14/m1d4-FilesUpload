// CRUD endpoints

import Express from "express";
import fs, { writeFile } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import uniqid from "uniqid";
import createHttpError from "http-errors";
import { checkAuthorsSchema, triggerBadRequest } from "../validation.js";

const authorsRouter = Express.Router();

const authorsJSONPath = join(
  dirname(fileURLToPath(import.meta.url)),
  "authors.json"
);
console.log(
  "TARGET:",
  join(dirname(fileURLToPath(import.meta.url)), "authors.json")
);

const getAuthors = () => JSON.parse(fs.readFileSync(authorsJSONPath));

const writeAuthors = (authorsArray) =>
  fs.writeFileSync(authorsJSONPath, JSON.stringify(authorsArray));

// POST (new author)

authorsRouter.post(
  "/",
  checkAuthorsSchema,
  triggerBadRequest,
  (req, res, next) => {
    try {
      const newAuthor = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date(),
        id: uniqid(),
      };

      const authorsArray = getAuthors();

      const emailInUse = authorsArray.some(
        (author) => author.email === req.body.email
      );

      if (!emailInUse) {
        authorsArray.push(newAuthor);
        writeAuthors(authorsArray);
        res.status(201).send({
          name: newAuthor.name + " " + newAuthor.surname,
          id: newAuthor.id,
        });
      } else {
        next(
          createHttpError(
            400,
            `${req.body.email} is already registered to another user `
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// GET (all authors)

authorsRouter.get("/", (req, res, next) => {
  try {
    const authorsArray = getAuthors();
    res.send(authorsArray);
  } catch (error) {
    next(error);
  }
});

// GET (single author)

authorsRouter.get("/:authorId", (req, res, next) => {
  try {
    const authorsArray = getAuthors();
    const foundAuthor = authorsArray.find(
      (author) => author.id === req.params.authorId
    );
    if (foundAuthor) {
      res.send(foundAuthor);
    } else {
      next(
        createHttpError(404, `Author with id ${req.params.authorId} not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// PUT

authorsRouter.put(
  "/:authorId",
  checkAuthorsSchema,
  triggerBadRequest,
  (req, res, next) => {
    try {
      const authorsArray = getAuthors();
      const index = authorsArray.findIndex(
        (author) => author.id === req.params.authorId
      );
      if (index !== -1) {
        const oldAuthor = authorsArray[index];
        const updatedAuthor = {
          ...oldAuthor,
          ...req.body,
          updatedAt: new Date(),
        };
        authorsArray[index] = updatedAuthor;
        writeAuthors(authorsArray);
        res.send(updatedAuthor);
      } else {
        next(
          createHttpError(
            404,
            `There is no author with this ${req.body.authorId} id`
          )
        );
      }
    } catch (error) {
      next(error);
    }
  }
);

// DELETE

authorsRouter.delete("/:authorId", (req, res, next) => {
  try {
    const authorsArray = getAuthors();
    const remainingAuthors = authorsArray.filter(
      (author) => author.id !== req.params.authorId
    );

    if (authorsArray.length !== remainingAuthors.length) {
      writeAuthors(remainingAuthors);
      res.status(204).send();
    } else {
      next(
        createHttpError(404, `Author with ${req.params.authorId} id not found`)
      );
    }
  } catch (error) {
    next(error);
  }
});

// POST (checkEmail)

authorsRouter.post("/checkEmail", (req, res) => {
  const authorsArray = getAuthors();

  const emailInUse = authorsArray.some(
    (author) => author.email === req.body.email
  );

  console.log("A", emailInUse);

  res.send(
    `This email: ${req.body.email} is already is use (bool:${emailInUse})`
  );
});

export default authorsRouter;
