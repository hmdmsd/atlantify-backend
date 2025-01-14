"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModel = void 0;
const sequelize_1 = require("sequelize");
const database_config_1 = require("../config/database.config");
class QueueModel extends sequelize_1.Model {
}
exports.QueueModel = QueueModel;
QueueModel.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
    },
    songId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    addedBy: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    position: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize: database_config_1.sequelize,
    tableName: 'queue',
    timestamps: true,
});
