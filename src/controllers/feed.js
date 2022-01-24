const { sequelize, Op } = require("sequelize");

const {
  feed,
  user,
  profile,
  followerFollowing,
  like,
  comment,
} = require("../../models");

exports.addFeed = async (req, res) => {
  try {
    await feed.create({
      userId: req.user.id,
      image: req.file.filename,
      caption: req.body.caption,
    });

    const dataFeed = await feed.findOne({
      where: {
        userId: req.user.id,
      },
      attributes: ["id", ["image", "fileName"], "caption"],
      include: {
        model: user,
        as: "user",
        attributes: ["id", "fullName", "username"],
        include: {
          model: profile,
          as: "profile",
          attributes: ["image"],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).send({
      status: "success",
      data: {
        feed: dataFeed,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failed",
      message: "Server error...",
    });
  }
};

exports.getFeedByFollow = async (req, res) => {
  try {
    const followings = await followerFollowing.findAll({
      where: {
        userId: req.params.id,
      },
      attributes: [],
      include: {
        model: user,
        as: "following",
        attributes: ["id", "username"],
        include: [
          {
            model: feed,
            as: "feed",
            attributes: [["userId"], "image", "caption"],
            include: {
              model: like,
              attributes: [
                [sequelize.fn("count", sequelize.col("feedId")), "cnt"],
              ],
            },
          },
        ],
      },
      raw: true,
      group: ["feedId"],
    });

    // const test = await feed.findAll({
    //   where: {
    //     userId: 1,
    //   },
    //   include: {
    //     model: like,
    //     attributes: [[sequelize.fn("count", sequelize.col("feedId")), "count"]],
    //   },
    //   group: "feedId",
    //   raw: true,
    //   loggin: true,
    // });

    res.status(200).send({
      status: "success",
      data: {
        feed: followings,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failed",
      message: "Server error...",
    });
  }
};

exports.getFeeds = async (req, res) => {
  try {
    const feeds = await feed.findAll({
      attributes: ["id", ["image", "fileName"], "caption"],
      include: {
        model: user,
        as: "user",
        attributes: ["id", "fullName", "username"],
        include: {
          model: profile,
          as: "profile",
          attributes: ["image"],
        },
      },
    });

    res.status(200).send({
      status: "success",
      data: {
        feed: feeds,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({
      status: "failed",
      message: "Server error...",
    });
  }
};

exports.like = async (req, res) => {
  try {
    const { id } = req.body;
    const isFeedExist = await feed.findOne({
      where: { id: id },
    });

    const isUserLiked = await like.findOne({
      where: {
        [Op.and]: [{ userId: req.user.id }, { feedId: id }],
      },
    });

    if (!isFeedExist) {
      return res.status(404).send({
        status: "failed",
        message: `Feed ${id} not found!`,
      });
    }

    if (isUserLiked) {
      return res.status(404).send({
        status: "failed",
        message: `You have liked this feed`,
      });
    }

    const likeFeed = await like.create({
      userId: req.user.id,
      feedId: req.body.id,
    });

    res.status(200).send({
      status: "success",
      data: {
        feed: {
          id: likeFeed.feedId,
        },
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

exports.getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await comment.findAll({
      where: { feedId: id },
      attributes: ["id", "comment"],
      include: {
        model: user,
        as: "user",
        attributes: ["id", "fullName", "username"],
        include: {
          model: profile,
          as: "profile",
          attributes: ["image"],
        },
      },
    });
    res.status(200).send({
      status: "success",
      data: {
        comments,
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

exports.addComment = async (req, res) => {
  try {
    const isFeedExist = await feed.findOne({
      where: { id: req.body.id },
    });

    if (!isFeedExist) {
      return res.status(404).send({
        status: "failed",
        message: `Feed ${id} not found!`,
      });
    }

    const dataComment = await comment.create({
      userId: req.user.id,
      feedId: req.body.id,
      comment: req.body.comment,
    });
    res.status(200).send({
      status: "success",
      data: {
        comment: {
          id: dataComment.id,
        },
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
