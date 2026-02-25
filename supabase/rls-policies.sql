-- Habilitar RLS en todas las tablas
ALTER TABLE "public"."User" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Account" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Session" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."VerificationToken" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."Profile" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."CV" ENABLE ROW LEVEL SECURITY;

-- Políticas para User: cada usuario solo ve su propio registro
CREATE POLICY "Users can view own record" ON "public"."User"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own record" ON "public"."User"
  FOR UPDATE USING (auth.uid()::text = id);

-- Políticas para Profile
CREATE POLICY "Users can view own profile" ON "public"."Profile"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own profile" ON "public"."Profile"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can update own profile" ON "public"."Profile"
  FOR UPDATE USING (auth.uid()::text = "userId");

-- Políticas para CV
CREATE POLICY "Users can view own CVs" ON "public"."CV"
  FOR SELECT USING (auth.uid()::text = "userId");

CREATE POLICY "Users can insert own CVs" ON "public"."CV"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users can delete own CVs" ON "public"."CV"
  FOR DELETE USING (auth.uid()::text = "userId");

-- Políticas para Account (solo el sistema puede gestionar)
CREATE POLICY "Service role manages accounts" ON "public"."Account"
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas para Session (solo el sistema puede gestionar)
CREATE POLICY "Service role manages sessions" ON "public"."Session"
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas para VerificationToken (solo el sistema puede gestionar)
CREATE POLICY "Service role manages verification tokens" ON "public"."VerificationToken"
  FOR ALL USING (auth.role() = 'service_role');