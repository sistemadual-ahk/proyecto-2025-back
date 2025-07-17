## Proyecto base TypeScript

### Requisitos
1. Entorno de [Node.js](https://nodejs.org/en "Node.js") instalado
2. Gestor de Dependencias [NPM](https://www.npmjs.com/ "NPM") instalado
3. Algún IDE para editar el código. Recomendado: [Visual Studio Code](https://code.visualstudio.com/ "Visual Studio Code") o [WebStorm](https://www.jetbrains.com/es-es/webstorm/ "WebStorm")

### Ejecución
1. Clonar el repositorio
2. Situados en la raíz del proyecto, instalar todas las dependencias: `npm install`
3. Ejecutar el index: `npm start` Si no se cambia el código inicial, se deberá ver un "Hola TS!" por la consola
4. Ejecutar los tests: `npm test` 

### ¿Dónde escribo mi código?
El proyecto está inspirado según el orden que plantea Maven, gestor de Dependencias para Java:
- Todo la lógica de negocio/dominio debe escribirse dentro de la carpeta `src/main`. Se sugiere crear subcarpetas dentro de la mencionada anteriormente para una mayor prolijidad.
- Todos los tests deben escribirse dentro de `src/test`. Se recomienda crear un archivo por cada clase TS que se quiera testear.
- La lógica de ejecución del componente debe escribirse en el archivo `src/index.ts`, el cual se ejecuta cuando se corre el comando `npm start`
