const properties = require('./json/properties.json');
const users = require('./json/users.json');

/// Users
const pg = require('pg');
const { response } = require('express');
const Pool = pg.Pool;

const configObj = {
  host : 'localhost',
  user : 'vagrant',
  password: '123',
  database: 'lightbnb'
};

const pool = new Pool(configObj);

pool.connect();

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */

const getUserWithEmail = function(email) {
  return pool.query(`
  SELECT * FROM users
  WHERE email = $1;`,[email])
    .then((users) => {
      if(!users) {
        return null;
      }
      // console.log(users.rows[0])
      return users.rows[0];
    })
    .catch((err) => {
      console.log(err);
    })
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  return pool.query(`
  SELECT * FROM users
  WHERE id = $1 ;`, [id])
    .then((users) => {
      if(!users){
        return null;
      }
      // console.log('id:',users.rows[0]);
      return users.rows[0];
    })
    .catch((err) => {
      console.log(err);
    })
}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {

  const newUser = [user.name, user.email, user.password];
  return pool.query(`
  INSERT INTO users (name, email, password)
  VALUES ($1, $2, $3)
  RETURNING *;
  `,newUser)
    .then((res) => {
      // console.log(res.rows[0])
      return res.rows[0]
    })
    .catch((err) => {
      console.log(err)
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {
  return pool
    .query(`
      SELECT properties.*
      FROM reservations
      JOIN properties ON property_id = properties.id
      WHERE guest_id = $1
      LIMIT $2
    `, [guest_id, limit])
    .then((list) => {
      // console.log(list.rows)
      return list.rows;
    })
}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  // hold any parameters thay may be available for the query
  const queryParams = [];

  // query before WHERE clause
  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    WHERE
  `;
  const addAnd =  () => {if (queryParams.length >= 1) {
    queryString += ` AND `
  }};

  // if city has been passed in as an option
  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `city LIKE $${queryParams.length}`;
  }

  // if owner_id has passed in, return properties belonging to that owner
  if (options.owner_id) {
    addAnd()
    queryParams.push(`${options.owner_id}`);
    queryString += `owner_id = $${queryParams.length}`;
  }

  if (options.minimum_price_per_night) {
    addAnd()
    queryParams.push(`${options.minimum_price_per_night}`);
    queryString += `cost_per_night > $${queryParams.length}`;
  }

  if (options.maximum_price_per_night) {
    addAnd()
    queryParams.push(`${options.maximum_price_per_night}`);
    queryString += `cost_per_night < $${queryParams.length}`;
  }

  queryString += `
    GROUP BY properties.id
  `

  if (options.minimum_rating) {
    queryParams.push(`${options.minimum_rating}`);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  // query after HAVING clause
  queryParams.push(limit);
  queryString += `
    ORDER BY cost_per_night
    LIMIT $${queryParams.length};
  `

  console.log(queryString, queryParams);

  return pool
    .query(queryString, queryParams)
    .then((res) => {
      return res.rows;
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
}
exports.addProperty = addProperty;
