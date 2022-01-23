const { user, profile, followerFollowing } = require("../../models");

exports.getUsers = async (req, res) => {
  try {
    const users = await user.findAll({
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
      include: {
        model: profile,
        as: "profile",
        attributes: {
          exclude: ["createdAt", "updatedAt", "id", "userId"],
        },
      },
    });

    const dataUsers = users.map((data) => {
      return {
        id: data.id,
        fullName: data.fullName,
        email: data.email,
        username: data.username,
        image: data.profile.image,
        bio: data.profile.bio,
      };
    });

    res.status(200).send({
      status: "success",
      data: {
        users: dataUsers,
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

exports.editUser = async (req, res) => {
  try {
    const { id } = req.params;

    await user.update(req.body, {
      where: {
        id,
      },
    });

    await profile.update(req.body, {
      where: {
        userId: id,
      },
    });

    const updatedDataUser = await user.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
      include: {
        model: profile,
        as: "profile",
        attributes: {
          exclude: ["createdAt", "updatedAt", "id", "userId"],
        },
      },
    });

    const dataUser = {
      id: updatedDataUser.id,
      fullName: updatedDataUser.fullName,
      email: updatedDataUser.email,
      username: updatedDataUser.username,
      image: updatedDataUser.profile.image,
      bio: updatedDataUser.profile.bio,
    };

    res.status(200).send({
      status: "success",
      data: {
        user: dataUser,
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

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await user.destroy({
      where: {
        id,
      },
    });
    res.status(200).send({
      status: "success",
      data: {
        id,
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

exports.getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUser = await followerFollowing.findAll({
      where: {
        followingUserId: id,
      },
      attributes: ["id", "userId"],
      include: {
        model: user,
        as: "follower",
        attributes: ["id", "fullName", "username"],
        include: {
          model: profile,
          as: "profile",
          attributes: ["userId", "image", "bio"],
        },
      },
    });
    // const dataUser = await user.findAll({
    //   where: {
    //     id: id,
    //   },
    //   attributes: ["id", "fullName", "username"],
    //   include: [
    //     // {
    //     //   model: profile,
    //     //   as: "profile",
    //     // },
    //     {
    //       model: followerFollowing,
    //       as: "followers",
    //       include: {
    //         model: user,
    //         as: "user",
    //       },
    //       where: {
    //         userId: id,
    //       },
    //     },
    //   ],
    // });

    res.status(200).send({
      status: "success",
      data: {
        user: {
          followers: dataUser,
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

exports.getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const dataUser = await followerFollowing.findAll({
      where: {
        userId: id,
      },
      attributes: ["id", "userId"],
      include: {
        model: user,
        as: "following",
        attributes: ["id", "fullName", "username"],
        include: {
          model: profile,
          as: "profile",
          attributes: ["userId", "image", "bio"],
        },
      },
    });

    res.status(200).send({
      status: "success",
      data: {
        user: {
          followings: dataUser,
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
