# Sistema de Evaluación con Paneles de Administrador y Estudiante

## Descripción
Sistema completo de evaluación de Tecnología e Informática con dos paneles diferenciados:
- **Panel de Estudiante**: Para realizar evaluaciones
- **Panel de Administrador**: Para gestionar y ver resultados

## Características

### Panel de Estudiante
- ✅ Interfaz amigable y moderna
- ✅ Formulario de registro de datos personales
- ✅ Evaluación de 20 preguntas de opción múltiple
- ✅ Navegación entre preguntas
- ✅ Cronómetro automático
- ✅ Resultados inmediatos al completar
- ✅ Instrucciones claras y guías

### Panel de Administrador
- ✅ Dashboard con estadísticas generales
- ✅ Lista completa de participantes
- ✅ Detalles individuales de cada evaluación
- ✅ Exportación de datos a CSV
- ✅ Visualización de respuestas por pregunta
- ✅ Tiempos de respuesta detallados
- ✅ Filtros y búsqueda

## Credenciales de Acceso

### Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Estudiante
- **Usuario**: Cualquier nombre de usuario
- **Contraseña**: Cualquier contraseña

## Instalación y Uso

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar base de datos
Crear un archivo `.env` en la raíz del proyecto:
```env
DATABASE_URL=mysql://usuario:contraseña@host:puerto/nombre_base_datos
```

### 3. Ejecutar el servidor
```bash
npm run dev:server
```

### 4. Ejecutar la aplicación
```bash
npm run dev
```

### 5. Acceder a la aplicación
Abrir http://localhost:5173 en el navegador

## Estructura de Archivos

```
src/
├── components/
│   ├── Auth.tsx          # Componente de autenticación
│   ├── AdminPanel.tsx    # Panel de administrador
│   └── StudentPanel.tsx  # Panel de estudiante
├── App.tsx               # Componente principal con navegación
├── QuizForm.tsx          # Formulario de evaluación
└── ...

server/
├── index.js              # Servidor Express con APIs
└── schema.sql            # Esquema de base de datos
```

## APIs Disponibles

### Para Estudiantes
- `POST /api/submit` - Enviar resultados de evaluación

### Para Administradores
- `GET /api/participants` - Obtener lista de participantes
- `GET /api/answers` - Obtener respuestas de evaluaciones
- `GET /api/question-times` - Obtener tiempos por pregunta

## Funcionalidades Técnicas

### Autenticación
- Sistema básico de login con roles
- Persistencia de sesión en el frontend
- Validación de credenciales

### Base de Datos
- Tabla `participants`: Datos de estudiantes y resultados
- Tabla `answers`: Respuestas individuales por pregunta
- Tabla `question_times`: Tiempo invertido por pregunta

### Interfaz de Usuario
- Diseño responsivo con Tailwind CSS
- Iconos de Lucide React
- Componentes modulares y reutilizables
- Estados de carga y feedback visual

## Personalización

### Agregar Nuevas Preguntas
Editar el array `preguntas` en `src/QuizForm.tsx`:
```typescript
const preguntas: Question[] = [
  {
    texto: "Tu pregunta aquí",
    componente: "Componente",
    opcion_a: "Opción A",
    opcion_b: "Opción B", 
    opcion_c: "Opción C",
    opcion_d: "Opción D",
    respuesta_correcta: 'a',
    skill_id: 1,
    difficulty: 1
  }
  // ... más preguntas
];
```

### Modificar Credenciales de Admin
Editar en `src/components/Auth.tsx`:
```typescript
if (username === 'admin' && password === 'admin123') {
  // Cambiar credenciales aquí
}
```

## Notas de Seguridad

⚠️ **Importante**: Este es un sistema de demostración. Para uso en producción:
- Implementar autenticación real con JWT
- Usar HTTPS
- Validar y sanitizar todas las entradas
- Implementar rate limiting
- Usar variables de entorno para credenciales sensibles

## Soporte

Para problemas o preguntas, revisar:
1. Logs del servidor en la consola
2. Errores en la consola del navegador
3. Estado de la base de datos
4. Configuración de variables de entorno
