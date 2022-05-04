/* Get details about a single user when a user logs in */

SELECT id, name, email, password
FROM users
WHERE email = 'tristanjacobs@gmail.com';