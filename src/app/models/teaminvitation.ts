import { Sequelize, ModelDefined, DataTypes } from 'sequelize';

export interface TeamInvitationAttributes {
  id: number;
  idTeam: number;
  user: string;
  token: string;
  bridgePassword: string;
  mnemonic: string;
}

export type TeamInvitationModel = ModelDefined<TeamInvitationAttributes, Omit<TeamInvitationAttributes, 'id'>>;

export default (database: Sequelize): TeamInvitationModel => {
  const TeamInvitation: TeamInvitationModel = database.define(
    'teamsinvitations',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      idTeam: DataTypes.INTEGER,
      user: DataTypes.STRING,
      token: DataTypes.STRING,
      bridgePassword: DataTypes.STRING,
      mnemonic: DataTypes.STRING,
    },
    {
      timestamps: false,
      underscored: true,
    },
  );

  return TeamInvitation;
};
