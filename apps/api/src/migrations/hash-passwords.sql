-- =====================================================================
-- Hashea las contraseñas que quedaron en texto plano.
-- Ejecutar UNA vez en el SQL Editor de Supabase (o con psql en local).
-- pgcrypto con gen_salt('bf') genera hashes bcrypt ($2a$) compatibles
-- con bcrypt.compare() de la API.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- El filtro evita volver a hashear un hash si el script se corre dos veces.
UPDATE usuarios
SET "contraseña" = crypt("contraseña", gen_salt('bf', 10))
WHERE "contraseña" !~ '^\$2[aby]\$';

-- Verificación: debe devolver 0.
SELECT count(*) AS sin_hashear
FROM usuarios
WHERE "contraseña" !~ '^\$2[aby]\$';
