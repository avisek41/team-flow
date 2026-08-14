-- Add hero/landmark image URL per city
ALTER TABLE cities
  ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1734120113512-799d0b21525a?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c3RhdHVlJTIwb2YlMjB1bml0eXxlbnwwfHwwfHx8MA%3D%3D'
WHERE id = 'ahmedabad';

UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1666843527155-14ec5f016802?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bXVtYmFpJTIwbWFyaW5lJTIwZHJpdmV8ZW58MHx8MHx8fDA%3D'
WHERE id = 'mumbai';

UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1657981630164-769503f3a9a8?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aHlkZXJhYmFkfGVufDB8fDB8fHww'
WHERE id = 'hyderabad';

UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1639980290886-6bdd61c7582b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b2Rpc2hhfGVufDB8fDB8fHww'
WHERE id = 'odisha';

UPDATE cities SET image_url = 'https://images.unsplash.com/photo-1588416936097-41850ab3d86d?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmVuZ2FsdXJ1fGVufDB8fDB8fHww'
WHERE id = 'bengaluru';
