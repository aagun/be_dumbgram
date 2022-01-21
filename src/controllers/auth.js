const { user } = require("../../models");
const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  // validation schema
  const schema = joi.object({
    fullName: joi.string().min(1).required(),
    username: joi.string().alphanum().required(),
    email: joi.string().email().required(),
    password: joi.string().min(6).required(),
  });

  // do validate
  const { error } = schema.validate(req.body);

  // if error exist send validation error message
  if (error) {
    return res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    });
  }

  try {
    const emailExist = await user.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    const usernameExist = await user.findOne({
      where: {
        username: req.body.username,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (emailExist && usernameExist) {
      return res.status(400).send({
        status: "failed",
        message: "Email already registered and username already taken",
      });
    }

    if (emailExist) {
      return res.status(400).send({
        status: "failed",
        message: "Email already registered",
      });
    }

    if (usernameExist) {
      return res.status(400).send({
        status: "failed",
        message: "Username already taken",
      });
    }

    // generate salt (random value) with 10 rounds
    const salt = await bcrypt.genSalt(10);

    // hash password from request with salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // insert into database
    const newUser = await user.create({
      fullName: req.body.fullName,
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    });

    const dataToken = {
      fullName: newUser.fullName,
      username: newUser.username,
    };

    // generate token
    const token = jwt.sign(dataToken, process.env.TOKEN_KEY);

    res.status(200).send({
      status: "success",
      data: {
        fullName: newUser.fullName,
        username: newUser.username,
        token,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failed",
      message: "Server error",
    });
  }
};
