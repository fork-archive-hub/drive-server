import { Sequelize, ModelDefined, DataTypes } from 'sequelize';

export interface TeamsMembersAttributes {
  id: number;
  idTeam: number;
  user: string;
  bridgePassword: string;
  bridgeMnemonic: string;
}

export type TeamMemberModel = ModelDefined<TeamsMembersAttributes, Omit<TeamsMembersAttributes, 'id'>>;

export default (database: Sequelize): TeamMemberModel => {
  const TeamMember: TeamMemberModel = database.define(
    'teamsmembers',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      idTeam: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      user: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bridgePassword: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bridgeMnemonic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: 'teamsmembers',
      timestamps: false,
      underscored: true,
    },
  );

  return TeamMember;
};
