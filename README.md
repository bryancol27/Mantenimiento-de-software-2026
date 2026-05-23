# 🚀 API de Productos y Reseñas (Mantenimiento de Software 2026)

Bienvenido a la **API de Productos y Reseñas**, una solución backend de alto rendimiento construida con **Node.js (ES Modules)**, **Express** y **SQLite** (`better-sqlite3`). Este proyecto implementa rigurosamente el patrón de **Arquitectura Hexagonal (Puertos y Adaptadores)** para garantizar el desacoplamiento, la testabilidad y la mantenibilidad a largo plazo de la lógica de negocio.

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una estructura limpia basada en **Arquitectura Hexagonal**, dividida en capas bien delimitadas con responsabilidades únicas:

```text
📂 src
 ├── 📂 domain            # Núcleo del negocio (Pure JS, sin dependencias externas)
 │    ├── 📂 models       # Entidades y lógica interna del negocio (Product, Review)
 │    └── 📂 ports        # Interfaces/Contratos (ProductRepository, ReviewRepository)
 ├── 📂 application       # Casos de Uso (Orquestadores de la lógica del negocio)
 │    └── 📂 use-cases    # Ej: GetProductDetails, ListProducts, UpdateProduct, etc.
 ├── 📂 adapters          # Adaptadores Primarios (Entrada) y Secundarios (Salida)
 │    ├── 📂 controllers  # Controladores Express (HTTP/Rest Adapters)
 │    └── 📂 repositories # Implementación concreta de base de datos (SQLite Adaptadores)
 └── 📂 infrastructure    # Configuración del entorno, frameworks e infraestructura web
      ├── 📂 database     # Conexión e inicialización de SQLite (sqlite.js)
      └── 📂 web          # Servidor Express, Middleware y enrutamiento (routes.js)
```

---

## 📋 Historias de Usuario (User Stories)

A continuación, se detallan las **Historias de Usuario** prioritarias del sistema con sus respectivos **Criterios de Aceptación (Gherkin)** y el desglose de su **Impacto Arquitectónico**.

---

### 🔍 HU-01: Obtener Detalle de un Producto con sus Reseñas

> **Como** cliente de la tienda  
> **Quiero** consultar los detalles de un producto específico por su ID junto con todas sus reseñas  
> **Para** poder leer los comentarios de otros compradores antes de tomar una decisión de compra.  

#### 🥒 Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Obtener un producto existente
  Dado que existe un producto con ID 1 y tiene 3 reseñas asociadas,
  Cuando realice una petición GET a /api/products/1,
  Entonces la respuesta debe retornar un código 200 OK con los datos del producto (ID, nombre, descripción, precio) y un arreglo reviews que contenga el detalle completo de las 3 reseñas.

Escenario: Buscar un producto inexistente
  Dado que no existe un producto con ID 999,
  Cuando realice una petición GET a /api/products/999,
  Entonces la respuesta debe retornar un código 404 Not Found con el mensaje "El producto con ID 999 no existe.".
```

#### 🛡️ Impacto Arquitectónico

- **Domain**: Ninguno nuevo (los modelos y puertos de repositorios existentes cubren la necesidad).
- **Application (Use Case)**: Crear `GetProductDetails.js` que reciba el ID, llame a `ProductRepository.findById` y `ReviewRepository.findByProductId`, y ensamble la respuesta.
- **Adapters (Controller)**: Agregar el método `getProductDetails` en `ProductController.js`.
- **Infrastructure (Web)**: Registrar la ruta `GET /api/products/:productId` en `routes.js`.

---

### 📊 HU-02: Filtros y Paginación en Listado de Productos

> **Como** cliente de la tienda con conexión limitada  
> **Quiero** filtrar los productos por rango de precio y paginar los resultados  
> **Para** encontrar artículos económicos rápidamente sin sobrecargar mi ancho de banda.  

#### 🥒 Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Listar productos con filtros y límites
  Dado que existen 20 productos registrados con precios de 10 a 500,
  Cuando envíe una petición GET a /api/products?minPrice=50&maxPrice=200&limit=5&page=1,
  Entonces la respuesta debe retornar un código 200 OK únicamente con los primeros 5 productos que tengan un precio entre 50 y 200, ordenados por ID de forma descendiente, además de metadatos de paginación (total, page, totalPages).
```

#### 🛡️ Impacto Arquitectónico

- **Domain (Ports)**: Modificar la firma en `ProductRepository.js` a `findAll({ minPrice, maxPrice, limit, offset })`.
- **Application (Use Case)**: Adaptar `ListProducts.js` para recibir y pasar parámetros de paginación y filtros.
- **Adapters (Repository)**: Modificar `SqliteProductRepository.js` para generar consultas dinámicas en SQLite usando cláusulas `WHERE price BETWEEN ? AND ?, LIMIT ? OFFSET ?`.

---

### ✏️ HU-03: Actualización de un Producto Existente

> **Como** administrador de la tienda  
> **Quiero** modificar el nombre, descripción o precio de un producto  
> **Para** corregir errores ortográficos o ajustar los precios en respuesta a la inflación.  

#### 🥒 Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Actualizar información con datos válidos
  Dado un producto con ID 1 y precio de $50,
  Cuando envíe una petición PUT a /api/products/1 con el cuerpo {"name": "Teclado Modificado", "price": 55.99},
  Entonces la respuesta debe retornar un 200 OK con los datos actualizados y guardarse permanentemente en la base de datos.

Escenario: Intentar actualizar con precio negativo
  Cuando envíe una petición PUT a /api/products/1 con {"price": -10},
  Entonces debe retornar un 400 Bad Request indicando que el precio no puede ser negativo, sin alterar la base de datos.
```

#### 🛡️ Impacto Arquitectónico

- **Domain**: Agregar un método de actualización al puerto `ProductRepository.js` (e.g., `update(product)`).
- **Application (Use Case)**: Crear `UpdateProduct.js` que obtenga el producto, aplique las mutaciones, ejecute `product.validate()` y persista los cambios.
- **Adapters**: Implementar la sentencia `UPDATE products SET ... WHERE id = ?` en el adaptador secundario de SQLite.

---

### 🗑️ HU-04: Eliminación de un Producto en Cascada

> **Como** administrador de inventarios  
> **Quiero** eliminar del catálogo un producto obsoleto  
> **Para** mantener la base de datos libre de registros antiguos e inservibles.  

#### 🥒 Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Eliminar un producto
  Dado un producto con ID 2 que tiene 5 reseñas registradas,
  Cuando envíe una petición DELETE a /api/products/2,
  Entonces el producto debe eliminarse y la base de datos debe eliminar en cascada automática las 5 reseñas para evitar datos huérfanos.
  Y retornar un código 204 No Content.
```

#### 🛡️ Impacto Arquitectónico

- **Domain (Ports)**: Definir `delete(id)` en `ProductRepository.js`.
- **Application (Use Case)**: Crear `DeleteProduct.js` que llame a `ProductRepository.delete(id)`.
- **Adapters (Repository)**: Implementar `DELETE FROM products WHERE id = ?` en `SqliteProductRepository.js`. Gracias a la restricción `ON DELETE CASCADE` de SQLite (inicializada en `sqlite.js`), la cascada es nativa y segura.
- **Infrastructure (Web)**: Habilitar `DELETE /api/products/:productId` en las rutas de Express.

---

### 🚫 HU-05: Restricción de una Sola Reseña por Correo Electrónico

> **Como** dueño de la tienda  
> **Quiero** evitar que un cliente (identificado por su email) escriba múltiples reseñas para el mismo producto  
> **Para** evitar la manipulación fraudulenta del promedio de calificación de un artículo.  

#### 🥒 Criterios de Aceptación (Gherkin)

```gherkin
Escenario: Intentar duplicar reseña
  Dado que el usuario juan@example.com ya registró una reseña en el producto con ID 1,
  Cuando intente enviar una nueva reseña en el producto 1 con el correo juan@example.com,
  Entonces la API debe bloquear el registro y responder con un código 409 Conflict y el mensaje "El usuario juan@example.com ya ha reseñado este producto.".
```

#### 🛡️ Impacto Arquitectónico

- **Domain (Models)**: Modificar la entidad `Review.js` para añadir la propiedad obligatoria `userEmail` y su respectiva validación regex de correo electrónico.
- **Domain (Ports)**: Agregar `findByProductAndEmail(productId, userEmail)` a `ReviewRepository.js`.
- **Application (Use Case)**: Modificar `CreateReview.js` para verificar si ya existe una reseña de ese usuario. Si existe, lanza un error de dominio.
- **Adapters**: Actualizar las tablas en `sqlite.js` para incluir la columna `userEmail` (se puede definir como `UNIQUE(productId, userEmail)` para blindar a nivel base de datos). Actualizar repositorios e inyectar el parámetro.

---

## ⚡ Guía de Instalación y Ejecución

Sigue estos sencillos pasos para poner en marcha el proyecto localmente:

### 1. Clonar e Instalar Dependencias

```bash
git clone https://github.com/bryancol27/Mantenimiento-de-software-2026.git
cd Mantenimiento-de-software-2026
npm install
```

### 2. Ejecutar la Aplicación

- **Modo Producción:**
  ```bash
  npm start
  ```
- **Modo Desarrollo (con auto-recarga):**
  ```bash
  npm run dev
  ```

El servidor estará escuchando por defecto en el puerto `3000` (http://localhost:3000).

### 3. Ejecutar Pruebas (Tests con Jest)

Este proyecto incluye una completa suite de pruebas unitarias y de integración:

```bash
# Ejecutar todas las pruebas
npm test
```

### 4. Formatear y Validar Código

Para asegurar la calidad del código y mantener un estilo consistente en todo el proyecto:

```bash
# Validar linter
npm run lint

# Auto-formatear con Prettier
npm run format
```

---

## 📦 Colección de Postman

Se incluye una colección de Postman en la raíz del proyecto para importar directamente y probar todos los endpoints:
👉 [Hexagonal_API_Postman_Collection.json](./Hexagonal_API_Postman_Collection.json)
