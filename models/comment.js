"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class comment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      comment.belongsTo(models.feed, {
        as: "feed",
        foreignKey: {
          name: "feedId",
        },
      });

      comment.belongsTo(models.user, {
        as: "user",
        foreignKe: {
          name: "userId",
        },
      });
    }
  }
  comment.init(
    {
      userId: DataTypes.INTEGER,
      feedId: DataTypes.INTEGER,
      comment: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "comment",
    }
  );
  return comment;
};
