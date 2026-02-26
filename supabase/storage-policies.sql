-- Políticas de Storage para el bucket 'cvs'
-- Ejecutar en Supabase → SQL Editor después de crear el bucket 'cvs' (privado)

-- Permitir subida solo al usuario autenticado en su carpeta
CREATE POLICY "Users can upload own CVs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir lectura solo al usuario autenticado de sus propios archivos
CREATE POLICY "Users can read own CVs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Permitir eliminación solo al usuario autenticado de sus propios archivos
CREATE POLICY "Users can delete own CVs" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'cvs' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );