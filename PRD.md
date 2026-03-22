# PRD - DevContractShield (actualizado al estado real de repos Frontend/Backend)

## 1. Vision del producto

DevContractShield busca reducir la subjetividad en la aceptacion de entregables de software mediante evidencia tecnica verificable y, en fases posteriores, resolucion economica on-chain.

En el estado actual de implementacion (repos `DevContractShieldFrontend` y `DevContractShieldBackend`), el producto se encuentra en etapa de base operativa: autenticacion, listado de contratos, ejecucion tecnica basica de pruebas para repositorios GitHub y una interfaz de dashboard demostrativa.

## 2. Problema

En acuerdos freelance de desarrollo, cliente y developer suelen carecer de un mecanismo objetivo y trazable para resolver si un entregable cumple.

Problemas observados:
- Criterios de aceptacion ambiguos o cambiantes.
- Baja trazabilidad tecnica de las decisiones.
- Integracion incompleta entre operacion de producto y capa economica on-chain.

## 3. Usuarios objetivo

- Cliente: crea y supervisa contratos, necesita visibilidad de estado y evidencia.
- Developer: entrega codigo, requiere reglas claras y resultado verificable.
- Operador de plataforma: ejecuta validaciones tecnicas y gestiona estados.

## 4. Estado actual del producto (implementado)

### 4.1 Frontend (Next.js 16 + React 19)

Implementado:
- Dashboard con navegacion lateral y tema claro/oscuro.
- Vista "Crear contrato" con formulario validado (`react-hook-form` + `zod`).
- Chat de IA en UI con respuestas mock (sin integracion real a API/LLM).
- Vista "Mis contratos" con estados y separacion activo/historial (datos mock).
- Vista de detalle de contrato con estado, hash de transaccion mock y terminal mock.
- Vista de ajustes de perfil/preferencias (sin persistencia real).

No implementado en frontend actual:
- Consumo real de API backend para auth, contratos o tests.
- Login/registro funcional en UI.
- Conexion de wallet y operaciones on-chain.
- Flujo real de funding, disputa, apelacion y payout.

### 4.2 Backend (NestJS 11 + Supabase)

Implementado:
- Auth:
  - `POST /auth/register`
  - `POST /auth/login`
  - JWT propio (Bearer) para rutas protegidas.
- Usuario autenticado:
  - `GET /users/me`
- Salud:
  - `GET /health`
  - `GET /health/live`
- Contratos:
  - `GET /contracts` con paginacion y filtros por estado de sistema/genlayer.
- Ejecucion tecnica de tests:
  - `POST /contracts/:id/tests/run`
  - `GET /logs/:id/stream` (SSE)
  - `GET /logs/:id/report`
  - `GET /contracts/:id/tests/coverage`

Comportamiento real del motor de pruebas:
- Clona repositorio GitHub (`simple-git`) del contrato.
- Exige `script.js` en raiz del repo clonado.
- Genera dinamicamente `script.test.js` y ejecuta `node --test`.
- Guarda `coverage` (porcentaje de tests pasados) en tabla `contracts`.
- Mantiene reportes/logs en memoria del proceso (no persistencia durable de reporte detallado).

No implementado en backend actual:
- Endpoints para crear/editar contrato desde frontend.
- Orquestacion real de chat IA para definir test packs.
- Test pack oficial versionado y firmado por ambas partes.
- Integracion backend->GenLayer para `createContract/fund/submitEvidence/releasePayment`.
- Pipeline de evidencia con hashes on-chain.

## 5. Alcance del PRD

### 5.1 In scope (estado actual confirmado)

- Plataforma web de dashboard demostrativo.
- API de autenticacion y consulta de contratos.
- Ejecucion de pruebas tecnicas basicas sobre repositorio GitHub.
- Modelo de estados de contrato disponible en frontend y en catalogos SQL.

### 5.2 Out of scope (actual)

- Escrow on-chain operativo de extremo a extremo.
- Wallet connect y firma de transacciones en frontend.
- Adjudicacion automatica on-chain basada en evidence bundle.
- Disputas/apelaciones funcionales.
- Soporte multi-stack real (actualmente acotado a `script.js` + Node test runner).

## 6. Requisitos funcionales

### 6.1 Requisitos funcionales vigentes (ya implementados)

- RF-01: Registrar usuario y emitir JWT de acceso.
- RF-02: Autenticar usuario por email/password.
- RF-03: Obtener perfil del usuario autenticado.
- RF-04: Listar contratos asociados al usuario (creador o developer) con paginacion/filtros.
- RF-05: Ejecutar una corrida de pruebas para contrato y exponer logs en streaming.
- RF-06: Consultar reporte de corrida y estado de coverage por contrato.

### 6.2 Requisitos funcionales pendientes (roadmap de producto)

- RF-P01: Crear contrato desde frontend contra backend.
- RF-P02: Integrar chat IA real para definicion de criterios/tests.
- RF-P03: Congelar test pack oficial con versionado y hash.
- RF-P04: Integrar flujo on-chain (funding, evidencia, payout/refund).
- RF-P05: Disputa y apelacion con semantica transaccional y trazabilidad.

## 7. Requisitos no funcionales

Aplicados actualmente:
- RNF-01: Validacion de payloads con `ValidationPipe` y DTOs.
- RNF-02: API tipada en TypeScript (NestJS + interfaces de respuesta).
- RNF-03: Logging basico de ejecucion y stream de eventos en tiempo real.

Brechas actuales:
- RNF-B01: Persistencia parcial de resultados (reportes en memoria del proceso).
- RNF-B02: Sin sandbox de ejecucion fuerte para codigo clonado.
- RNF-B03: Ausencia de control de concurrencia/cuotas por ejecucion.
- RNF-B04: Seguridad JWT con secreto default de fallback en codigo.

## 8. UX y experiencia de usuario

Estado UX actual:
- UI consistente en dashboard, estados y detalle.
- Flujo de contrato y "terminal" orientado a demo.

Limitaciones UX actuales:
- La mayor parte del flujo de negocio usa datos mock (sin persistencia/backoffice real).
- No existe journey completo autenticado desde UI hasta endpoints protegidos.
- Mensajes y montos en UI no estan alineados de forma consistente con GEN/GenLayer.

## 9. Arquitectura de alto nivel

Arquitectura actual:
- Frontend (`DevContractShieldFrontend`): Next.js App Router, componentes cliente, estado local.
- Backend (`DevContractShieldBackend`): NestJS modular (`auth`, `users`, `contracts`, `tests`, `health`).
- Persistencia: Supabase (PostgreSQL) consumido via cliente admin/anon.
- Testing runtime: clon de repositorio + ejecucion local `node --test`.

Arquitectura objetivo (no implementada aun):
- Capa de adjudicacion y escrow on-chain integrada con backend como operador.
- Evidence bundle versionado y trazable (off-chain + resumen on-chain).
- Frontend conectado a API real y a wallet provider.

## 10. API y sistemas

### 10.1 Endpoints backend disponibles

Publicos:
- `POST /auth/register`
- `POST /auth/login`
- `GET /health`
- `GET /health/live`
- `GET /logs/:id/stream` (SSE)

Protegidos por JWT:
- `GET /users/me`
- `GET /contracts`
- `POST /contracts/:id/tests/run`
- `GET /logs/:id/report`
- `GET /contracts/:id/tests/coverage`

### 10.2 Integraciones externas actuales

- Supabase Auth Admin API (alta de usuario) y tablas de dominio.
- GitHub (clone de repos por URL).

### 10.3 Integraciones no presentes aun

- GenLayer transaccional desde backend operativo.
- Wallet provider en frontend.
- LLM productivo para chat/test generation.

## 11. Coherencia Frontend/Backend y gaps detectados

Coherencia parcial:
- Nomenclatura de estados (`created`, `testing`, `under_review`, etc.) esta alineada en frontend y backend.

Inconsistencias relevantes:
- Frontend usa datos mock; backend expone endpoints reales no consumidos por UI.
- UI muestra montos en `ETH` en contratos mock, mientras la propuesta del producto es `GEN`.
- Backend asume `contractId` numerico en rutas de tests (`parseInt`), pero el esquema SQL de `contracts` define `id UUID`.
- Backend convierte `req.user.sub` con `parseInt` para filtrar contratos, aunque `sub` suele ser UUID/string.
- Flujo esperado de IA + test pack + evidencia no coincide con implementacion actual de tests (solo `script.js` + `node --test`).

## 12. Metricas y KPIs

### 12.1 KPIs operativos actuales (medibles ya)

- Tasa de registro exitoso (`register_success_rate`).
- Tasa de login exitoso (`login_success_rate`).
- Tiempo promedio de corrida de tests (`test_run_duration_ms`).
- Porcentaje de corridas fallidas por infraestructura vs por test (`test_infra_fail_rate`).
- Contratos con coverage disponible (`contracts_with_coverage_rate`).

### 12.2 KPIs de producto objetivo (pendientes de instrumentar)

- % contratos con flujo end-to-end completo (creacion -> evaluacion -> adjudicacion).
- % decisiones resueltas sin disputa.
- Tiempo medio a resolucion de contrato.
- Monto total protegido en escrow (GEN).

## 13. Riesgos principales

- Riesgo de modelo de datos inconsistente (UUID vs numerico) bloqueando filtros y ejecuciones.
- Riesgo de seguridad por ejecucion de codigo de terceros sin sandbox robusto.
- Riesgo de drift de producto por divergencia entre UI demo y capacidades backend reales.
- Riesgo de percepcion: PRD historico sugiere on-chain E2E, pero los repos evaluados aun no lo implementan.

## 14. Roadmap recomendado

### Fase 1 - Integracion base FE/BE

- Conectar frontend a auth real (`register/login/me`).
- Consumir `GET /contracts` en vista de contratos.
- Reemplazar mocks de detalle por datos reales.

### Fase 2 - Dominio de contratos y evidencia

- Crear endpoints de alta/edicion de contrato.
- Persistir reportes completos de test (no solo coverage).
- Normalizar IDs y tipos de datos en todo el stack (UUID o numerico, uno solo).

### Fase 3 - Flujo objetivo DevContractShield

- Implementar test pack oficial (versionado, hash, aprobacion).
- Integrar backend con operaciones GenLayer.
- Integrar wallet en frontend y trazabilidad de transacciones.

### Fase 4 - Disputas y hardening

- Disputa/apelacion funcionales.
- Sandbox de ejecucion y aislamiento robusto.
- Observabilidad, auditoria y politicas de seguridad productivas.

## 15. Criterios de aceptacion

### 15.1 Release de consolidacion FE/BE

- CA-01: Usuario puede autenticarse desde UI y consultar perfil real.
- CA-02: Lista de contratos en UI proviene del backend sin datos mock.
- CA-03: Desde detalle de contrato se puede lanzar tests y ver logs SSE reales.
- CA-04: Coverage mostrado en UI coincide con valor persistido en DB.

### 15.2 Release de flujo objetivo (futuro)

- CA-F01: Contrato puede crearse, fondearse y adjudicarse con traza verificable.
- CA-F02: Evidencia tecnica queda persistida con hash y metadatos reproducibles.
- CA-F03: Pago/liberacion o refund responde al resultado adjudicado.

## 16. Supuestos y preguntas abiertas

Supuestos usados para este PRD:
- El alcance solicitado se basa exclusivamente en los repos `DevContractShieldFrontend` y `DevContractShieldBackend`.
- La logica de smart contracts existe en otro repositorio y no forma parte de la verificacion funcional aqui descrita.

Preguntas abiertas criticas:
- Se estandarizara `contracts.id` como UUID o como entero en backend/DB?
- El JWT oficial sera el emitido por backend propio o tokens nativos de Supabase Auth?
- Cual sera el formato contractual final del test pack (esquema, versionado, firma y hash)?
- En que fase se integra formalmente GenLayer en el backend productivo?
- Cual es el stack minimo soportado para evaluacion tecnica en v1 (solo Node script o multiplataforma)?
