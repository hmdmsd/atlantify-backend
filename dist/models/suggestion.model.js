"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestionModel = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = require("../config/database.config");
class SuggestionModel extends sequelize_1.Model {
}
exports.SuggestionModel = SuggestionModel;
SuggestionModel.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    artist: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    suggestedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    votes: {
        type: sequelize_1.DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
    },
}, {
    sequelize: database_config_1.sequelize,
    tableName: 'suggestions',
    timestamps: true,
});
