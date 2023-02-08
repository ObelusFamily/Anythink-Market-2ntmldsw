//TODO: seeds script should come here, so we'll be able to put some data in our local env

const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require("../models/User");
require("../models/Item");
require("../models/Comment");

mongoose.connect(process.env.MONGODB_URI);
//users, products. comments

const User = mongoose.model('User');
const Product = mongoose.model('Item');
const Comment = mongoose.model('Comment');

//Adding generate fake user data

//generating 100 users, each user has one comment left to one item
(async () => {
    let seedProgress = '*'
    for(let i = 1; i<= 100; i++) {
        //create a fake user
        let user = await User.create({
            'username': faker.name.firstName() + i,
            'email': faker.internet.email()
        });

        //create a fake product item
        let item = await Product.create({
            'slug': faker.lorem.slug(),
            'title': faker.commerce.product(),
            'description': faker.lorem.paragraph(),
        })

        //link a comment to this user and item
        await Comment.create({
            'body': faker.lorem.paragraph(),
            'user': user,
            'item': item
        })
        console.log('Seeding ' + seedProgress.repeat(i))
    }
})().then(() => {
    console.log('successfully seeded');
    mongoose.connection.close()
});