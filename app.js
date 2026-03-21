// Plesk entry point — delegates to the actual backend server
import { app } from './backend/app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Portfolio running on port ${PORT}`);
});
