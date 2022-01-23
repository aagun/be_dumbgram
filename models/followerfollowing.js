"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class followerFollowing extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      followerFollowing.belongsTo(models.user, {
        as: "follower",
        foreignKey: {
          name: "userId",
        },
      });
      followerFollowing.belongsTo(models.user, {
        as: "following",
        foreignKey: {
          name: "followingUserId",
        },
      });
    }
  }
  followerFollowing.init(
    {
      userId: DataTypes.INTEGER,
      followingUserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "followerFollowing",
    }
  );
  return followerFollowing;
};
