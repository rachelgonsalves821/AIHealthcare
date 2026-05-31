import { createApp } from './app';

const port = process.env['PORT'] ?? 8080;
const app = createApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on port ${port}`);
});
