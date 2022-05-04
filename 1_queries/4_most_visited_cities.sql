/* Get a list of most visited cities
- name of the city and totla reservations
- order highest to lowest
*/

SELECT DISTINCT city, count(reservations) as total_reservations
FROM properties
  JOIN reservations ON properties.id = property_id
GROUP BY properties.city
ORDER BY total_reservations DESC;
