"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SongModel = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = require("../config/database.config");
class SongModel extends sequelize_1.Model {
}
exports.SongModel = SongModel;
SongModel.init({
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
    duration: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    path: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    uploadedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    size: {
        type: sequelize_1.DataTypes.INTEGER, // Store size in bytes
        allowNull: false,
        defaultValue: 0,
    },
}, {
    sequelize: database_config_1.sequelize,
    tableName: 'songs',
    timestamps: true,
});
