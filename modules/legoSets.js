
const setData = require("../data/setData");
const themeData = require("../data/themeData");


require('dotenv').config();
const Sequelize = require('sequelize');

const sequelize = new Sequelize
(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  }
);

const Theme = sequelize.define(
  'Theme',
  {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);


const Set = sequelize.define(
  'Set',
  {
    set_num: {
      type: Sequelize.STRING,
      primaryKey: true,
    },
    name: Sequelize.STRING,
    year: Sequelize.INTEGER,
    num_parts: Sequelize.INTEGER,
    theme_id: Sequelize.INTEGER,
    img_url: Sequelize.STRING,
  },
  {
    timestamps: false,
  }
);


Set.belongsTo(Theme, { foreignKey: 'theme_id' });

function initialize() {
  return sequelize.sync().catch((err) => {
    throw err;
  });
}

function getAllSets() 
{
  return Set.findAll({ include: [Theme] });
}

function getSetByNum(setNum) 
{
  return Set.findAll({
    include: [Theme],
    where: { set_num: setNum },
  }).then((sets) => {
    if (sets.length > 0) return sets[0];
    else throw new Error('Unable to find requested set');
  });
}

function getSetsByTheme(theme) 
{
  return Set.findAll({
    include: [Theme],
    where: {
      '$Theme.name$': {
        [Sequelize.Op.iLike]: `%${theme}%`,
      },
    },
  }).then((sets) => {
    if (sets.length > 0) return sets;
    else throw new Error('Unable to find requested sets');
  });
}


function addSet(setData) 
{
  return Set.create(setData).catch((err) => {
    throw new Error(err.errors[0].message);
  });
}

function editSet(set_num, setData) 
{
  return new Promise((resolve, reject) => {
    Set.update(setData, { where: { set_num } })
      .then(() => resolve())
      .catch((err) => reject(err.errors[0].message));
  });
}

function deleteSet(setNum) 
{
  return new Promise((resolve, reject) => {
      Set.destroy({ where: { set_num: setNum } })
          .then(() => resolve())
          .catch(err => reject(err.errors[0].message));
  });
}

function getAllThemes()
{
  return Theme.findAll();
}


module.exports = {
  initialize,
  getAllSets,
  getSetByNum,
  getSetsByTheme,
  addSet,
  editSet,
  deleteSet,
  getAllThemes
};

// Code Snippet to insert existing data from Set / Themes

// sequelize
//   .sync()
//   .then( async () => {
//     try{
//       await Theme.bulkCreate(themeData);
//       await Set.bulkCreate(setData); 
//       console.log("-----");
//       console.log("data inserted successfully");
//     }catch(err){
//       console.log("-----");
//       console.log(err.message);

//       // NOTE: If you receive the error:

//       // insert or update on table "Sets" violates foreign key constraint "Sets_theme_id_fkey"

//       // it is because you have a "set" in your collection that has a "theme_id" that does not exist in the "themeData".   

//       // To fix this, use PgAdmin to delete the newly created "Themes" and "Sets" tables, fix the error in your .json files and re-run this code
//     }

//     process.exit();
//   })
//   .catch((err) => {
//     console.log('Unable to connect to the database:', err);
//   });


