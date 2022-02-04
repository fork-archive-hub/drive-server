import { Sequelize, ModelDefined, DataTypes } from 'sequelize';

export interface TeamAttributes {
  id: number;
  admin: string;
  name: string;
  bridgeUser: string;
  bridgePassword: string;
  bridgeMnemonic: string;
  totalMembers: number;
}

export type TeamModel = ModelDefined<TeamAttributes, Omit<TeamAttributes, 'id'>>;

export default (database: Sequelize): TeamModel => {
  const Team: TeamModel = database.define(
    'teams',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      admin: {
        type: DataTypes.STRING
      },
      name: {
        type: DataTypes.STRING
      },
      bridgeUser: {
        type: DataTypes.STRING
      },
      bridgePassword: {
        type: DataTypes.STRING
      },
      bridgeMnemonic: {
        type: DataTypes.STRING
      },
      totalMembers: {
        type: DataTypes.STRING
      },
    },
    {
      tableName: 'teams',
      timestamps: false,
      underscored: true,
    },
  );

  return Team;
};
