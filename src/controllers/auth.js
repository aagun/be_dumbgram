const { user, profile } = require("../../models");
const joi = require("joi");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const checkUser = async (condition) => {
  return user.findOne({
    where: {
      ...condition,
    },
    attributes: {
      exclude: ["createdAt", "updatedAt"],
    },
  });
};

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
    const emailExist = await checkUser({ email: req.body.email });
    const usernameExist = await checkUser({ username: req.body.username });

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
    // const newUser = await profile.create(
    //   {
    //     user: {
    //       fullName: req.body.fullName,
    //       username: req.body.username,
    //       email: req.body.email,
    //       password: hashedPassword,
    //     },
    //   },
    //   {
    //     include: {
    //       model: user,
    //       as: "user",
    //     },
    //   }
    // );

    const newUser = await user.create(
      {
        fullName: req.body.fullName,
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,
        profile: {},
      },
      {
        include: {
          model: profile,
          as: "profile",
        },
      }
    );

    const dataToken = {
      fullName: newUser.fullName,
      username: newUser.username,
    };

    // generate token
    const token = jwt.sign(dataToken, process.env.TOKEN_KEY);

    res.status(200).send({
      status: "success",
      data: {
        ...dataToken,
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

exports.login = async (req, res) => {
  // validation schema
  const schema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required(),
  });

  // do validate and get the error
  const { error } = schema.validate(req.body);

  // if error exist send response
  if (error) {
    return res.status(400).send({
      status: "failed",
      error: {
        message: error.details[0].message,
      },
    });
  }

  try {
    const userExist = await checkUser({ email: req.body.email });
    if (!userExist) {
      return res.status(400).send({
        status: "failed",
        message: "Email and password do not match",
      });
    }

    const isValid = await bcrypt.compare(req.body.password, userExist.password);
    if (!isValid) {
      return res.status(400).send({
        status: "failed",
        message: "Email and password do not match",
      });
    }

    const dataToken = {
      id: userExist.id,
      fullName: userExist.fullName,
      username: userExist.username,
      email: userExist.email,
    };

    const token = jwt.sign(dataToken, process.env.TOKEN_KEY);

    res.status(200).send({
      status: "success",
      data: {
        user: {
          fullName: dataToken.fullName,
          username: dataToken.username,
          email: dataToken.email,
          token,
        },
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failed",
      message: "Server erorr...",
    });
  }
};
