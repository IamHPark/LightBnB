/* show specific details about properties located in Vancouver, including average rating
- order lowest to higest cost_per_night
- limit results to 10
- only show listings that rating >= 4
*/

SELECT properties.id, title, cost_per_night, avg(property_reviews.rating) as average_rating
FROM properties
  LEFT JOIN property_reviews ON properties.id = property_id
WHERE city LIKE '%ancouv%'
GROUP BY properties.id
HAVING avg(property_reviews.rating) >= 4
ORDER BY cost_per_night
LIMIT 10;