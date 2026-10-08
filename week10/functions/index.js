const { setGlobalOptions } = require("firebase-functions");
const { onRequest } = require("firebase-functions/https");
const {
  onDocumentCreated,
} = require("firebase-functions/v2/firestore");

const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

setGlobalOptions({
  region: "australia-southeast2",
  maxInstances: 1,
});

/**
 * Task 9.1
 * Returns the number of documents in the books collection.
 */
exports.countBooks = onRequest(
  { cors: true },
  async (request, response) => {
    if (request.method !== "GET") {
      response.status(405).json({
        error: "Method not allowed",
      });
      return;
    }

    try {
      const db = getFirestore();

      const snapshot = await db
        .collection("books")
        .count()
        .get();

      const count = snapshot.data().count;

      response.status(200).json({
        count,
      });
    } catch (error) {
      console.error(
        "Unable to count books:",
        error,
      );

      response.status(500).json({
        error: "Unable to count books",
      });
    }
  },
);

/**
 * Task 10.2
 * Returns every document in the books collection as JSON.
 */
exports.getAllBooks = onRequest(
  { cors: true },
  async (request, response) => {
    if (request.method !== "GET") {
      response.status(405).json({
        error: "Method not allowed",
      });
      return;
    }

    try {
      const db = getFirestore();

      const snapshot = await db
        .collection("books")
        .orderBy("isbn", "asc")
        .get();

      const books = snapshot.docs.map((document) => ({
        id: document.id,
        ...document.data(),
      }));

      response.status(200).json(books);
    } catch (error) {
      console.error(
        "Unable to retrieve books:",
        error,
      );

      response.status(500).json({
        error: "Unable to retrieve books",
      });
    }
  },
);

/**
 * Task 9.2
 * Automatically capitalizes every string field when a new
 * document is created in the books collection.
 */
exports.capitalizeBook = onDocumentCreated(
  "books/{bookId}",
  async (event) => {
    const snapshot = event.data;

    if (!snapshot) {
      console.log("No Firestore document was provided.");
      return;
    }

    const bookData = snapshot.data();
    const capitalizedData = {};

    for (const [field, value] of Object.entries(bookData)) {
      if (typeof value === "string") {
        capitalizedData[field] = value.toUpperCase();
      }
    }

    if (Object.keys(capitalizedData).length === 0) {
      console.log(
        `Document ${snapshot.id} has no string fields.`,
      );
      return;
    }

    await snapshot.ref.update(capitalizedData);

    console.log(
      `Capitalized book document: ${snapshot.id}`,
    );
  },
);

