const { validationResult } = require('express-validator/check');
const fs = require('fs');
const path = require('path');

const Post = require('../models/post');

module.exports.getPosts = (req, res, next) => {
  const page = req.query.page || 1;
  let totalItems;
  Post.countDocuments()
    .then(total => {
      totalItems = total;

      return Post.find()
        .skip((page - 1) * 3)
        .limit(3)
    })
    .then(posts => {
      console.log(posts);
      return res.json({
        posts: posts,
        totalItems: totalItems
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.message = 'Unable to load posts';
        err.statusCode = 500;
      }
      next(err);
    });
};

module.exports.createPost = (req, res, next) => {
  const { title, content } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty() || !req.file) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.errors = errors.array();
    return next(error);
  }

  const post = new Post({
    title: title,
    content: content,
    imageUrl: req.file.path.replace("\\", "/"),
    creator: {
      name: 'Orifjon'
    }
  });

  post.save()
    .then(result => {
      return res.status(201).json({
        post: result
      });
    })
    .catch(err => {
      const error = new Error('Unable to load posts');
      error.statusCode = 500;
      error.errors = err;
      next(error);
    });

};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;

  Post
    .findById(postId)
    .then(post => {
      if (post) {
        return res.status(200).json({
          post: post
        });
      }

      const error = new Error("Post wasn't found.");
      error.statusCode = 404;
      next(error);
    })
    .catch(err => {
      const error = new Error('Unable to load a post');
      error.statusCode = 500;
      next(error);
    });

};

exports.updatePost = (req, res, next) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
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
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then(result => {
      res.status(200).json({ message: 'Post updated!', post: result });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.deletePost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Could not find post.');
        error.statusCode = 404;
        throw error;
      }
      // Check logged in user
      clearImage(post.imageUrl);
      return Post.findByIdAndRemove(postId);
    })
    .then(result => {
      console.log(result);
      res.status(200).json({ message: 'Deleted post.' });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

const clearImage = filePath => {
  filePath = path.join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
};
