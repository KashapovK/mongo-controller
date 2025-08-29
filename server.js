const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authorSchema = new mongoose.Schema({
  name: String,
  country: String,
});
const bookSchema = new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
});
const Author = mongoose.model('Author', authorSchema);
const Book = mongoose.model('Book', bookSchema);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/books', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const totalCount = await Book.countDocuments();
    const pagesCount = Math.ceil(totalCount / limit);

    const books = await Book.aggregate([
      {
        $lookup: {
          from: 'authors',
          localField: 'author',
          foreignField: '_id',
          as: 'authorData',
        },
      },
      { $unwind: '$authorData' },
      {
        $project: {
          _id: 1,
          title: 1,
          author: '$authorData.name',
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]);

    res.json({ books, pagesCount, totalCount });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

mongoose
  .connect('mongodb://127.0.0.1:27017/booksdb')
  .then(async () => {
    const authorsCount = await Author.countDocuments();
    if (authorsCount === 0) {
      const authors = await Author.insertMany([
        { name: 'John Smith', country: 'USA' },
        { name: 'Alice Brown', country: 'UK' },
        { name: 'Ivan Petrov', country: 'Russia' },
      ]);
      await Book.insertMany([
        { title: 'Book A', author: authors[0]._id },
        { title: 'Book B', author: authors[1]._id },
        { title: 'Book C', author: authors[2]._id },
        { title: 'Book D', author: authors[0]._id },
        { title: 'Book E', author: authors[1]._id },
        { title: 'Book F', author: authors[2]._id },
        { title: 'Book G', author: authors[0]._id },
      ]);
      console.log('✅ База заполнена тестовыми данными');
    }

    app.listen(5000, () => console.log('🚀 Server started on port 5000'));
  })
  .catch((err) => console.error(err));
