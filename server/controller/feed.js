const { validationResult } = require('express-validator/check');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');
const User = require('../models/user');

module.exports.getPosts = async (req, res, next) => {
  const page = req.query.page || 1;
  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .skip((page - 1) * 3)
      .limit(3)
      .populate('creator');

    return res.json({
      posts: posts,
      totalItems: totalItems
    });
  }
  catch (err) {
    if (!err.statusCode) {
      err.message = 'Unable to load posts';
      err.statusCode = 500;
    }
    next(err);
  }
};

module.exports.createPost = async (req, res, next) => {
  const { title, content } = req.body;
  const userId = req.userId;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty() || !req.file) {
      const error = new Error('Validation failed');
      error.statusCode = 422;
      error.errors = errors.array();
      throw error;
    }

    const post = new Post({
      title: title,
      content: content,
      imageUrl: req.file.path.replace("\\", "/"),
      creator: userId
    });

    await post.save();
    const user = await User.findById(userId);

    user.posts.push(post);
    await user.save();

    return res.status(201).json({
      post: post,
      creator: user
    });
  }
  catch (err) {
    if (!err.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);
    if (post) {
      return res.status(200).json({
        post: post
      });
    }

    const error = new Error("Post wasn't found.");
    error.statusCode = 404;
    throw error;
  }
  catch (err) {
    if (!err.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

exports.updatePost = async (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);

  try {

    if (!errors.isEmpty()) {
      const error = new Error('Validation failed, entered data is incorrect.');
      error.statusCode = 422;
      throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
      imageUrl = req.file.path.replace("\\", "/");
    }
    if (!imageUrl) {
      const error = new Error('No file picked.');
      error.statusCode = 422;
      throw error;
    }

    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    await post.save();

    res.status(200).json({ message: 'Post updated!', post: post });
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error('Could not find post.');
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized');
      error.statusCode = 403;
      throw error;
    }

    // Check logged in user
    clearImage(post.imageUrl);
    await Post.findByIdAndRemove(postId);
    const user = await User.findById(req.userId);

    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: 'Deleted post.' });
  }
  catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
