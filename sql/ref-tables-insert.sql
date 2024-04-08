INSERT INTO azure_meadows_nh.activity_types VALUES
  (DEFAULT, 'Inactive - Inactive', 0, TRUE), 
  (DEFAULT, 'Derby Participant - Derby Full Participation', 100, TRUE), 
  (DEFAULT, 'Derby Participant - 80% Participation', 80, TRUE), 
  (DEFAULT, 'Derby Participant - Partial Participation', 50, TRUE), 
  (DEFAULT, 'Animal - Chicken', 75, TRUE), 
  (DEFAULT, 'Animal - Cow', 60, TRUE), 
  (DEFAULT, 'Animal - Pig', 50, TRUE), 
  (DEFAULT, 'Animal - Sheep', 40, TRUE), 
  (DEFAULT, 'Animal - Goat', 30, TRUE), 
  (DEFAULT, 'Crop - Fast Crop (1hr or less)', 60, TRUE), 
  (DEFAULT, 'Crop - Medium Crop (1hr - 6hr)', 50, TRUE), 
  (DEFAULT, 'Crop - Slow Crop (Greater than 6hr)', 40, TRUE), 
  (DEFAULT, 'Production Machine - Sugar Mill/Dairy', 75, TRUE), 
  (DEFAULT, 'Production Machine - Smelter, Jam Maker', 30, TRUE), 
  (DEFAULT, 'Production Machine - Sewing Machine, Ice Cream Maker', 50, TRUE), 
  (DEFAULT, 'Inactive - Responded In Game Chat', 10, TRUE), 
  (DEFAULT, 'Inactive - Game Time Off', 25, TRUE), 
  (DEFAULT, 'Activity Check - Announced Activity', 95, TRUE)
;


INSERT INTO azure_meadows_nh.action_types VALUES
  (DEFAULT, 'Joined Neighborhood', TRUE),
  (DEFAULT, 'Left Neighborhood', TRUE),
  (DEFAULT, 'Kicked from Neighborhood', TRUE),
  (DEFAULT, 'Strike', TRUE),
  (DEFAULT, 'Promoted', TRUE),
  (DEFAULT, 'Demoted', TRUE),
  (DEFAULT, 'Farm Name Change', TRUE)
;


INSERT INTO azure_meadows_nh.derby_types VALUES
  (DEFAULT, 'Normal', 9, 9, 1, 320),
  (DEFAULT, 'Blossom', 9, 9, 1, 320),
  (DEFAULT, 'Bunny', 9, 9, 1, 320),
  (DEFAULT, 'Power', 18, 18, 1, 320),
  (DEFAULT, 'Mystery', 9, 9, 1, 320),
  (DEFAULT, 'Bingo', 9, 9, 1, 320),
  (DEFAULT, 'Chill', 30, 35, 5, 50)
;

