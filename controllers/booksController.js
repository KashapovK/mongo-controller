const Book = require('../models/book');

const getBooks = async (req, res) => {
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

    res.json({
      books,
      pagesCount,
      totalCount,
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};

module.exports = { getBooks };
