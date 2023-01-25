import { application } from "./application";

export const startTheServer = () => {
  const app = application();
  const port = process.env.PORT;

  app.listen(port, () => {
    console.log(`Server is up listening on PORT ${port}`);
  });
};

startTheServer();