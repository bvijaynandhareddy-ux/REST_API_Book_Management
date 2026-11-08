/**
 * ============================================================================
 * Lab3_REST_API - SQLite Database Configuration & Initialization
 * ----------------------------------------------------------------------------
 * Student Details:
 *   Name: B. Vijay Nadha Reddy
 *   Registration Number: 252U1R1031
 *   Section: CSE (CORE) – 2A
 *   College: Aurora
 *   Year: II Year, Term II
 *   Faculty: Joel Prashanth D
 * ============================================================================
 */

const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const path = require('path');

// Absolute path to SQLite database file
const DB_PATH = path.join(__dirname, 'books.db');

let dbInstance = null;

/**
 * Initializes and returns the SQLite database connection.
 * Automatically creates the `books` table and seeds sample records if empty.
 *
 * @returns {Promise<import('sqlite').Database>} The database connection instance
 */
async function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    // Open connection using sqlite wrapper for clean async/await
    dbInstance = await open({
      filename: DB_PATH,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await dbInstance.run('PRAGMA foreign_keys = ON;');

    // Create books table if it does not already exist
    await dbInstance.exec(`
      CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        price REAL NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if table contains records; if empty, seed initial books for testing
    const countRow = await dbInstance.get('SELECT COUNT(*) AS total FROM books');
    if (countRow.total === 0) {
      console.log('[Database] Initializing empty books table with sample data...');

      const sampleBooks = [
        ['Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', 42.50],
        ['The Pragmatic Programmer: Your Journey to Mastery', 'Andrew Hunt & David Thomas', 49.99],
        ['JavaScript: The Good Parts', 'Douglas Crockford', 29.99],
        ['Design Patterns: Elements of Reusable Object-Oriented Software', 'Erich Gamma et al.', 54.00],
        ['You Don\'t Know JS: Scope & Closures', 'Kyle Simpson', 19.95],
        ['Node.js Design Patterns', 'Mario Casciaro & Luciano Mammino', 45.00],
        ['Introduction to Algorithms', 'Thomas H. Cormen', 85.00],
        ['Eloquent JavaScript: A Modern Introduction', 'Marijn Haverbeke', 32.50]
      ];

      const insertStmt = await dbInstance.prepare(
        'INSERT INTO books (title, author, price) VALUES (?, ?, ?)'
      );

      for (const book of sampleBooks) {
        await insertStmt.run(book);
      }
      await insertStmt.finalize();

      console.log(`[Database] Successfully seeded ${sampleBooks.length} sample books.`);
    }

    return dbInstance;
  } catch (error) {
    console.error('[Database Error] Failed to initialize SQLite database:', error.message);
    throw error;
  }
}

module.exports = {
  getDatabase,
  DB_PATH
};

