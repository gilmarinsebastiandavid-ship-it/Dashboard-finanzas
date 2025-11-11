# 💰 Dashboard de Finanzas Personales

Dashboard interactivo para gestionar tus finanzas personales con alertas de presupuesto, metas de ahorro y análisis visual de tus ingresos y gastos.

## 🚀 Características

- ✅ Registro de ingresos y gastos
- 📊 Gráficas interactivas (tendencias, distribución, comparativas)
- 🎯 Metas de ahorro personalizadas
- 💸 Alertas automáticas de presupuesto
- 📅 Filtros por mes para ver historial
- 📥 Exportación de reportes (JSON y TXT)
- 📱 Diseño responsive (funciona en móviles y tablets)

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (versión 16 o superior)
  - Descarga desde: https://nodejs.org/
  - Para verificar si está instalado: `node --version`
- **npm** (viene incluido con Node.js)
  - Para verificar: `npm --version`

## 🛠️ Instalación Paso a Paso

### 1. Crear la estructura del proyecto

Crea una carpeta para tu proyecto y navega a ella:

```bash
mkdir dashboard-finanzas
cd dashboard-finanzas
```

### 2. Crear los archivos de configuración

#### **package.json**

Crea un archivo llamado `package.json` con este contenido:

```json
{
  "name": "dashboard-finanzas",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1",
    "recharts": "^2.5.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9"
  }
}
```

#### **vite.config.js**

Crea un archivo llamado `vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

#### **index.html**

Crea un archivo llamado `index.html` en la raíz del proyecto:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard de Finanzas</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

### 3. Crear la carpeta src y los archivos React

Crea la carpeta `src`:

```bash
mkdir src
```

#### **src/main.jsx**

Crea el archivo `src/main.jsx`:

```javascript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### **src/App.jsx**

Crea el archivo `src/App.jsx` y copia el código completo del componente FinanceDashboard desde el artifact anterior.

### 4. Instalar dependencias

En la terminal, dentro de la carpeta del proyecto, ejecuta:

```bash
npm install
```

⏱️ *Este proceso puede tomar 1-2 minutos dependiendo de tu conexión.*

### 5. Iniciar el servidor de desarrollo

Una vez instaladas las dependencias, ejecuta:

```bash
npm run dev
```

Verás un mensaje similar a:

```
  VITE v4.3.9  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 6. Abrir en el navegador

Abre tu navegador y ve a:

```
http://localhost:5173
```

¡Tu dashboard ya está funcionando! 🎉

## 📖 Cómo Usar

### Crear una Meta de Ahorro

1. Click en el botón **"Metas de Ahorro"**
2. Completa el formulario:
   - Nombre: ej. "Vacaciones"
   - Meta ($): ej. 2000000
   - Fecha límite: selecciona una fecha
3. Click en **"Agregar Meta"**

### Registrar un Ahorro

1. Click en **"Nueva Transacción"**
2. Completa:
   - Descripción: ej. "Ahorro quincenal"
   - Monto: ej. 100000
   - Tipo: **Gasto**
   - Categoría: **Ahorro**
   - Meta de Ahorro: selecciona la meta creada
   - Fecha: selecciona la fecha
3. Click en **"Guardar Transacción"**

El progreso de tu meta se actualizará automáticamente ✨

### Registrar Gastos

1. Click en **"Nueva Transacción"**
2. Tipo: **Gasto**
3. Categoría: selecciona (Alimentación, Transporte, etc.)
4. Completa los demás campos
5. Guardar

### Configurar Presupuestos

1. Click en **"Presupuestos"**
2. Selecciona una categoría
3. Define el monto mensual
4. Recibirás alertas cuando te acerques al límite

### Filtrar por Mes

Usa el selector de mes en la parte superior para ver transacciones de meses anteriores.

### Exportar Reportes

Click en los botones **JSON** o **TXT** para descargar un reporte completo del mes seleccionado.

## 🎨 Estructura del Proyecto

```
dashboard-finanzas/
├── index.html          # Página principal
├── package.json        # Dependencias del proyecto
├── vite.config.js      # Configuración de Vite
├── src/
│   ├── main.jsx       # Punto de entrada de React
│   └── App.jsx        # Componente principal del dashboard
└── node_modules/       # Dependencias instaladas (generado automáticamente)
```

## ⚠️ Importante

**Los datos NO se guardan permanentemente.** Al recargar la página, todas las transacciones, presupuestos y metas se perderán. 

Si quieres persistencia de datos, considera agregar:
- **localStorage** para guardar datos en el navegador
- **Base de datos** (Firebase, Supabase) para acceso desde cualquier dispositivo

## 🛑 Detener el Servidor

Para detener el servidor de desarrollo:
- Presiona `Ctrl + C` en la terminal

## 🔄 Comandos Útiles

```bash
# Iniciar servidor de desarrollo
npm run dev

# Crear versión de producción
npm run build

# Previsualizar versión de producción
npm run preview
```

## 🐛 Solución de Problemas

### Error: "command not found: npm"
**Solución:** Instala Node.js desde https://nodejs.org/

### Error: "Cannot find module"
**Solución:** Ejecuta `npm install` nuevamente

### El puerto 5173 está ocupado
**Solución:** Cierra otras aplicaciones que usen ese puerto o Vite usará otro puerto automáticamente

### Las gráficas no se ven
**Solución:** Verifica que tengas conexión a internet (Tailwind CSS se carga desde CDN)

## 📝 Notas

- El dashboard está optimizado para navegadores modernos (Chrome, Firefox, Safari, Edge)
- Se recomienda usar en pantallas de al menos 1024px para mejor experiencia
- Los datos se mantienen mientras la pestaña esté abierta

## 🤝 Contribuciones

Si encuentras algún bug o tienes sugerencias de mejora, ¡son bienvenidas!

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

Desarrollado con ❤️ para mejorar tus finanzas personales