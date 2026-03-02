import { join } from "path";

export default () => ({
  appName: process.env.APP_NAME || 'MyNestApp',
  version: process.env.APP_VERSION || 'development',
  port: parseInt(process.env.APP_PORT || '3000', 10),
  jwt_secret: process.env.JWT_SECRET,
  pg: process.env.PG || 0,
  src: join(process.cwd(), 'src'),
  langs: ['uz', 'ru', 'en']   
});