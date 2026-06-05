const bcrypt = require('bcryptjs');

bcrypt.compare(
  'password123',
  '$2a$10$KruIMVt0jWk1CF.OTpG.T.xDZvDdytJcRbLYK2LWxgDXX624b5vlW'
).then(console.log);