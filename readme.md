# 🛍️ Clothing Store API + Frontend

Proyecto completo de una **tienda de ropa** con **API REST (Flask + MongoDB Atlas)** y un **frontend (HTML, CSS, Bootstrap, JS con AJAX)**.  
Incluye CRUD completo para todas las colecciones y reportes personalizados.

---

## 🚀 Tecnologías Utilizadas

- **Backend:** Python, Flask, Flask-PyMongo, Flask-CORS  
- **Base de datos:** MongoDB Atlas  
- **Frontend:** HTML5, CSS3, Bootstrap 5, JavaScript (AJAX con Axios)  
- **Control de versiones:** Git + GitHub  

---

## 📂 Estructura del Proyecto

```
/clothing_store
│   .env                       # Variables de entorno (Mongo URI de Atlas)
│   README.md                  # Instrucciones y documentación del proyecto
│   requirements.txt            # Dependencias del proyecto
│
├── front-end
│   ├── index.html              # Interfaz principal (CRUD + reports)
│   │
│   ├── scripts/
│   │   └── app.js              # Lógica de CRUD y reports con AJAX/Axios
│   │
│   └── styles/
│       └── app.css             # Estilos con Bootstrap y CSS personalizado
│
└── api
    └── v1
        ├── run.py              # Punto de entrada de Flask
        └── app
            ├── index.py        # Configuración de Flask, PyMongo y CORS
            │
            ├── controllers/    # Controladores de las colecciones y reports
            └── models/         # Modelos de las colecciones
```

---

## ⚙️ Instalación y Ejecución

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/usuario/PROYECTO-GIB-HUB.git
   cd PROYECTO-GIB-HUB
   ```

2. **Crear y activar un entorno virtual (recomendado):**
   ```bash
   python -m venv .venv
   source .venv/bin/activate   # En Linux/Mac
   .venv\Scripts\activate    # En Windows
   ```

3. **Instalar dependencias:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno:**  
   Crear un archivo `.env` en la raíz del proyecto con el contenido:
   ```env
   MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/clothing_store
   ```

5. **Ejecutar la API:**
   ```bash
   cd api/v1
   python run.py
   ```
   La API quedará corriendo en `http://127.0.0.1:5000`.

6. **Abrir el frontend:**  
   Abrir en el navegador el archivo `front-end/index.html`.

---

## 🗄️ Colecciones en MongoDB

El proyecto maneja las siguientes colecciones:

- **brands** → Marcas de ropa  
- **clothing** → Prendas y calzado  
- **sales** → Ventas realizadas  
- **users** → Usuarios registrados  

Todas las colecciones están relacionadas mediante **IDs autogenerados**.

---

## 📊 Reportes Implementados

1. **Listado de todas las marcas que tienen al menos una venta.**  
2. **Prendas vendidas y su cantidad restante en stock.**  
3. **Top 5 marcas más vendidas y cantidad de ventas.**  

---

## 🧑‍💻 Endpoints Principales

Ejemplo de endpoints disponibles (documentados en los controllers):

- `GET /api/v1/brands` → Listar marcas  
- `POST /api/v1/brands` → Crear marca  
- `PUT /api/v1/brands/<id>` → Editar marca  
- `DELETE /api/v1/brands/<id>` → Eliminar marca  

*(Se repite la misma lógica para `clothing`, `sales`, `users`)*

---

## ✅ Requisitos del Proyecto

Archivo `requirements.txt` incluido con todas las dependencias:

```
blinker==1.9.0
click==8.2.1
colorama==0.4.6
dnspython==2.7.0
Flask==3.1.1
flask-cors==6.0.1
Flask-PyMongo==3.0.1
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.2
pymongo==4.13.2
python-dotenv==1.1.1
Werkzeug==3.1.3
```

---

## 🤝 Contribución

Si deseas contribuir, haz un **fork** del proyecto, crea una rama con tu mejora y abre un **Pull Request**.

---

## 📜 Licencia

Este proyecto es de uso libre para fines educativos y puede adaptarse a proyectos reales.
