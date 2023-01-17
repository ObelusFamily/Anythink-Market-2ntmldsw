var mongoose = require("mongoose");
var uniqueValidator = require("mongoose-unique-validator");
var slug = require("slug");
var User = mongoose.model("User");

const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const generateImage = async (title) => {
  const response = await openai.createImage({
    prompt: title,
    n: 1,
    size: "256x256",
  });
  image_url = response.data.data[0].url;
  return image_url
}

var ItemSchema = new mongoose.Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    image: String,
    favoritesCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tagList: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

ItemSchema.plugin(uniqueValidator, { message: "is already taken" });

ItemSchema.pre("validate", function(next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

ItemSchema.methods.slugify = function() {
  this.slug =
    slug(this.title) +
    "-" +
    ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
};

ItemSchema.methods.updateFavoriteCount = function() {
  var item = this;

  return User.count({ favorites: { $in: [item._id] } }).then(function(count) {
    item.favoritesCount = count;

    return item.save();
  });
};

ItemSchema.methods.toJSONFor = async function(user) {
  return {
    slug: this.slug,
    title: this.title,
    description: this.description,
    image: this.image || await generateImage(this.title),
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    tagList: this.tagList,
    favorited: user ? user.isFavorite(this._id) : false,
    favoritesCount: this.favoritesCount,
    seller: this.seller.toProfileJSONFor(user)
  };
};

mongoose.model("Item", ItemSchema);
