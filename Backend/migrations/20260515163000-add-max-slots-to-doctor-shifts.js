'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('doctor_shifts', 'maxSlots', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Số lượng slot tối đa cho ca khám này'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('doctor_shifts', 'maxSlots');
  }
};
