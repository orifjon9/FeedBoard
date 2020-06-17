module.exports.getPosts = (req, res, next) => {
    res.json({
        posts: [{
            _id: 1,
            title: 'Post 1',
            content: 'Awesome post. Please, read!',
            creator: {
                name: 'Orifjon'
            },
            createdAt: new Date()
        }]
    })
};

module.exports.createPost = (req, res, next) => {

};