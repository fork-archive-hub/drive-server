module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('photos', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      photo_id: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      type: {
        type: Sequelize.STRING
      },
      size: {
        type: Sequelize.BIGINT.UNSIGNED
      },
      bucket_id: {
        type: Sequelize.STRING
      },
      created_at: {
        type: Sequelize.DATE
      }
    });
  },

  down: (queryInterface) => {
    return queryInterface.dropTable('photos');
  }
};
