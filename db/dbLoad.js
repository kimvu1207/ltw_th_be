// db/dbLoad.js
const mongoose = require("mongoose");
require("dotenv").config();
const bcrypt = require("bcrypt");

const models = require("../modelData/models.js");
const User = require("../db/userModel.js");
const Photo = require("../db/photoModel.js");
const SchemaInfo = require("../db/schemaInfo.js");

const versionString = "1.0";

async function dbLoad() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB Atlas!");
  } catch (error) {
    console.error("Unable to connect to MongoDB Atlas!", error);
    return;
  }

  try {
    await User.deleteMany({});
    await Photo.deleteMany({});
    await SchemaInfo.deleteMany({});
    console.log("Cleared existing data in users, photos, and schemaInfo collections");
  } catch (error) {
    console.error("Error clearing collections:", error);
    return;
  }

  const userModels = models.userListModel();
  console.log("Loaded user models:", userModels.length, "users");
  const mapFakeId2RealId = {};
  for (const user of userModels) {
    console.log("Attempting to create user:", user.login_name);
    const userObj = new User({
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
      login_name: user.login_name,
      password: user.password,
    });
    try {
      await userObj.save();
      mapFakeId2RealId[user._id] = userObj._id;
      user.objectID = userObj._id;
      console.log(
        "Added user:",
        user.first_name + " " + user.last_name,
        "with ID",
        user.objectID,
        "and login_name",
        user.login_name
      );
    } catch (error) {
      console.error("Error creating user", user.login_name, ":", error);
    }
  }

  const photoModels = [];
  const userIDs = Object.keys(mapFakeId2RealId);
  console.log("User IDs:", userIDs);
  userIDs.forEach(function (id) {
    photoModels.push(...models.photoOfUserModel(id));
  });
  console.log("Loaded photo models:", photoModels.length, "photos");
  for (const photo of photoModels) {
    console.log("Attempting to create photo:", photo.file_name);
    const photoObj = await Photo.create({
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: mapFakeId2RealId[photo.user_id],
    });
    photo.objectID = photoObj._id;
    if (photo.comments) {
      photo.comments.forEach(function (comment) {
        photoObj.comments = photoObj.comments.concat([
          {
            comment: comment.comment,
            date_time: comment.date_time,
            user_id: mapFakeId2RealId[comment.user._id],
          },
        ]);
        console.log(
          "Adding comment of length %d by user %s to photo %s",
          comment.comment.length,
          mapFakeId2RealId[comment.user._id],
          photo.file_name
        );
      });
    }
    try {
      await photoObj.save();
      console.log(
        "Added photo:",
        photo.file_name,
        "of user ID",
        photoObj.user_id
      );
    } catch (error) {
      console.error("Error creating photo", photo.file_name, ":", error);
    }
  }

  try {
    const schemaInfo = await SchemaInfo.create({
      version: versionString,
    });
    console.log("SchemaInfo object created with version", schemaInfo.version);
  } catch (error) {
    console.error("Error creating schemaInfo:", error);
  }

  try {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB Atlas");
  } catch (error) {
    console.error("Error disconnecting from MongoDB:", error);
  }
}

dbLoad();