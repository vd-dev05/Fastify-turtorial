import path from 'path';
import { addAliases } from 'module-alias';

const projectRoot = path.resolve(__dirname, '../../');
const isProduction = process.env.NODE_ENV === 'production';

addAliases({
  '@config': path.join(projectRoot, isProduction ? 'dist' : 'src', 'config'),
  '@api': path.join(projectRoot, isProduction ? 'dist' : 'src', 'api'),
  '@infrastructure': path.join(projectRoot, isProduction ? 'dist' : 'src', 'infrastructure'),
  '@utils': path.join(projectRoot, isProduction ? 'dist' : 'src', 'utils'),
});
