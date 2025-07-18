
# 📌 Proyecto Node.js + TypeScript + Express

Este proyecto es una base para desarrollar APIs REST utilizando Node.js, TypeScript y Express, estructurado para mantener el código limpio, escalable y fácil de mantener.

---

## ✅ Requisitos

1. [Node.js](https://nodejs.org/en) instalado.
2. [NPM](https://www.npmjs.com/) como gestor de dependencias.
3. Recomendado: un IDE como [Visual Studio Code](https://code.visualstudio.com/) o [WebStorm](https://www.jetbrains.com/webstorm/).

---

## 🚀 Ejecución del proyecto

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd <nombre-del-proyecto>
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el servidor en modo desarrollo

```bash
npm start
```

Verás en consola mensajes como:
```
Conectado a MongoDB Atlas
Servidor corriendo en puerto 3000
```

### 4. Ejecutar los tests

```bash
npm test
```

---

## 📂 Estructura del Proyecto

```
src/
├── config/              # Configuración general (ej. conexión a base de datos)
│   └── db.ts
├── main/
│   ├── app.ts           # Configuración principal de Express
│   ├── routes/          # Definición de endpoints y rutas
│   ├── controllers/     # Controladores para manejar Request y Response
│   ├── services/        # Lógica de negocio
│   ├── models/          # Modelos de datos (si se usan bases de datos)
│   └── middlewares/     # Middlewares personalizados (opcional)
├── test/                # Tests unitarios con Jest
└── index.ts             # Punto de entrada del servidor
```

---

## 📌 Descripción de carpetas y archivos

- **`index.ts`**: Punto de entrada de la app. Se conecta a la base de datos y levanta el servidor.

- **`app.ts`**: Configuración principal de Express (middlewares, rutas, logs).

- **`routes/`**: Define los endpoints y a qué controlador están vinculados.

- **`controllers/`**: Controlan la lógica del Request/Response. Validan datos y devuelven respuestas estandarizadas. Incluye `base.controller.ts` para respuestas genéricas.

- **`services/`**: Contiene la lógica de negocio (ejemplo: formatear mensajes, hacer consultas a base de datos).

- **`models/`**: (opcional) Define los esquemas si se utiliza Mongoose u ORM.

- **`middlewares/`**: (opcional) Middlewares reutilizables, como validaciones, autenticaciones, etc.

- **`test/`**: Tests con Jest para probar services, controladores y lógica del negocio.

---

## 🧪 Testing

El proyecto incluye configuración con **Jest** y soporte a **ts-jest** para testear directamente en TypeScript.

Ejemplo para correr tests:
```bash
npm test
```

Ejemplo de test simple en `src/test/saludo.test.ts`:
```typescript
import { obtenerMensajeSaludo } from "@services/saludo.service";

describe("Saludo Service", () => {
  it("debería devolver un saludo con el nombre", () => {
    const nombre = "Carlos";
    const mensaje = obtenerMensajeSaludo(nombre);
    expect(mensaje).toBe("Hola, Carlos!");
  });
});
```

---

## 🛠️ Alias de Imports

Este proyecto usa **aliases** para simplificar los imports. Están definidos en `tsconfig.json` y `jest.config.ts`.

| Alias | Ruta |
|--------|------|
| `@config/*` | src/config/* |
| `@controllers/*` | src/main/controllers/* |
| `@routes/*` | src/main/routes/* |
| `@services/*` | src/main/services/* |

Ejemplo de uso:
```typescript
import saludoRoutes from "@routes/saludo.routes";
```

---

## 📦 Scripts disponibles

| Comando | Descripción |
|----------|-------------|
| `npm start` | Inicia el servidor con ts-node y paths configurados. |
| `npm test` | Ejecuta los tests con Jest. |

---

## 📝 Notas Adicionales

- La conexión a MongoDB Atlas está configurada en `src/config/db.ts` usando `dotenv` para variables de entorno.
- La estructura modular permite escalar el proyecto fácilmente agregando nuevos servicios, controladores y rutas.
- Se recomienda crear un controlador, un servicio y una ruta por cada recurso principal de la API.

---

### 💬 Ejemplo de Endpoint

GET `http://localhost:3000/api/saludos`  
Respuesta:
```json
{
  "data": "¡Hola desde la API con TypeScript y Express!"
}
```

POST `http://localhost:3000/api/saludos/saludar`  
Body:
```json
{ "nombre": "Carlos" }
```
Respuesta:
```json
{
  "data": "Hola, Carlos!"
}
```
