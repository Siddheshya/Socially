const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const user = require("../models/user");
const User = require("../models/user");
const jwt = require('jsonwebtoken')

exports.getPosts = (req, res, next) => {
  
  let totalItems
  const perPage = 2;
  const currentPage = req.query.currentPage
  Post.find().countDocuments().then(count=>{
    totalItems = count
    return Post.find().skip((currentPage-1)*perPage).limit(perPage)
  }).then((posts) => {
      res
        .status(200)
        .json({ message: "Fetched Posts successfully", posts: posts,totalItems: totalItems });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.createPosts = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }
  if (!req.file) {
    const error = new Error("file not found");
    error.statusCode = 422;
    throw error;
  }
  let creator
  const imageUrl = req.file.path.replace("\\", "/");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imageUrl: imageUrl,
    creator:req.userId
  });

  post
    .save()
    .then((results) => {
      return User.findById(req.userId)
    }).then(user=>{
      creator = user
      user.Posts.push(post)
      return user.save()
      
    }).then(results=>{
      res.status(201).json({
        message: "Posts Created",
        post: post,
        creator:{_id:creator._id,name:creator.name}
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.getPost = (req, res, next) => {
  
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post does not exist");
        error.statusCode = 404;
        throw error;
      }
      res.json({ message: "Post fetched", posts: post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.updatePost = (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    const error = new Error("Validation failed");
    error.statusCode = 422;
    throw error;
  }
  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.body.image;

  if (!req.file) {
    imageUrl = req.file.path.replace("\\", "/");
  }
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("Post does not exist");
        error.statusCode = 404;
        throw error;
      }
      if(post.creator._id.toString()!==req.userId){
        const error = new Error("Not authorized")
        error.statusCode = 403
        throw error
      }
      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;
      return post.save()
    })
    .then(result=>{
        res.json({message:"post updated",post:result})
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
exports.deletePost = (req,res,next) => {
  const postId = req.params.postId
  Post.findById(postId).then(post=>{
    if (!post) {
      const error = new Error("Post does not exist");
      error.statusCode = 404;
      throw error;
    }
    if(post.creator._id.toString()!==req.userId){
      const error = new Error("Not authorized")
      error.statusCode = 403
      throw error
    }
    return Post.findByIdAndRemove(postId)
  }).then(result=>{
    res.status(200).json({message:"Post deleted"})
  }).catch(err=>{
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}
