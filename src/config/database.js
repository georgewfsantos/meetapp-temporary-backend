require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  host: '192.168.99.100',
  username: 'postgres',
  password: 'docker',
  database: 'meetapp',
  define: {
    timestamps: 'true',
    underscored: 'true',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
};
