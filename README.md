# Uber Clone Frontend - CS2031 DBP

Frontend React + TypeScript para la integracion E2E con el backend oficial del laboratorio `cs2031-2026-1-week14-e2e-2`.

Este repositorio contiene solo el frontend. El backend debe estar en otro repositorio/carpeta y ejecutarse aparte.

## Requisitos

- Node.js 20 o superior
- Backend Spring Boot corriendo en `http://localhost:8080`

## Backend oficial

Clonar y levantar el backend en otra carpeta:

```bash
git clone https://github.com/CS2031-DBP/cs2031-2026-1-week14-e2e-2.git
cd cs2031-2026-1-week14-e2e-2
./mvnw spring-boot:run
```

En Windows PowerShell:

```powershell
git clone https://github.com/CS2031-DBP/cs2031-2026-1-week14-e2e-2.git
cd cs2031-2026-1-week14-e2e-2
./mvnw spring-boot:run
```

El backend debe quedar activo en:

```text
http://localhost:8080
```

## Ejecutar frontend

En este repositorio:

```bash
npm install
npm run dev
```

La app queda en:

```text
http://localhost:5173
```

## Variables de entorno

No necesitas `.env` si el backend corre en `http://localhost:8080`.

Si quieres cambiar la URL del backend, crea un archivo `.env`:

```text
VITE_API_URL=http://localhost:8080
```

Tambien se incluye `.env.example` como referencia.

## Validacion

```bash
npm run lint
npm run build
```

## Usuarios de prueba

| Rol | Email | Password |
|---|---|---|
| Pasajero | ana@uber.com | pass123 |
| Pasajero | sofia@uber.com | pass123 |
| Conductor | carlos@uber.com | pass123 |
| Conductor | pedro@uber.com | pass123 |
| Conductor ocupado | lucia@uber.com | pass123 |

## Funcionalidades cubiertas

| Rubrica | Implementacion |
|---|---|
| Login / Register | Login, registro y carga de perfil con `GET /users/me` |
| Passenger dashboard | Perfil, solicitud de viaje, conductores disponibles e historial |
| Request trip | `GET /drivers/available` y `POST /trips` |
| Trip detail passenger | Detalle, polling y calificacion |
| Driver dashboard | Pendientes, mis viajes y aceptar viaje |
| Trip detail driver | Detalle y completar viaje |
| History filter | Filtro por estado para pasajero y conductor |

## Endpoints consumidos

| Endpoint | Uso |
|---|---|
| `POST /auth/login` | Iniciar sesion |
| `POST /auth/register` | Registrar usuario |
| `GET /users/me` | Obtener perfil autenticado |
| `GET /drivers/available` | Ver conductores disponibles |
| `POST /trips` | Crear viaje |
| `GET /trips` | Historial del pasajero |
| `GET /trips/pending` | Viajes pendientes para conductor |
| `GET /trips/my` | Historial del conductor |
| `GET /trips/{id}` | Detalle y polling |
| `PATCH /trips/{id}/accept` | Aceptar viaje |
| `PATCH /trips/{id}/complete` | Completar viaje |
| `POST /trips/{id}/rate` | Calificar conductor |

## Flujo de prueba recomendado

1. Levanta el backend.
2. Levanta el frontend.
3. Inicia sesion como `ana@uber.com`.
4. Solicita un viaje.
5. Cierra sesion.
6. Inicia sesion como `carlos@uber.com`.
7. Acepta el viaje pendiente.
8. Abre el detalle y completalo.
9. Cierra sesion.
10. Vuelve a entrar como `ana@uber.com`.
11. Abre el viaje completado y califica al conductor.

## Subir este frontend a GitHub

```bash
git init
git add .
git commit -m "Add Uber Clone E2E frontend"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/TU_REPO_FRONTEND.git
git push -u origin main
```
