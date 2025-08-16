const tsConfigPaths = require('tsconfig-paths');
const path = require('path');

// Configurar los paths manualmente para producción
const baseUrl = path.resolve(__dirname, 'dist');
const paths = {
  '@config/*': ['config/*'],
  '@controllers/*': ['main/controllers/*'],
  '@services/*': ['main/services/*'],
  '@routes/*': ['main/routes/*'],
  '@models/*': ['main/models/*'],
  '@middlewares/*': ['main/middlewares/*'],
  '@utils/*': ['utils/*'],
  '@types/*': ['types/*']
};

// Registrar los paths
tsConfigPaths.register({
  baseUrl,
  paths
});
