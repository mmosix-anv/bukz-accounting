DO $$ BEGIN
  ALTER TABLE "course_reviews"
    ADD CONSTRAINT "course_reviews_rating_range_check"
    CHECK ("rating" BETWEEN 1 AND 5);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "enrollments_user_course_unique_idx"
  ON "enrollments" ("user_id", "course_id");

CREATE INDEX IF NOT EXISTS "enrollments_user_id_idx"
  ON "enrollments" ("user_id");

CREATE INDEX IF NOT EXISTS "enrollments_course_id_idx"
  ON "enrollments" ("course_id");

CREATE UNIQUE INDEX IF NOT EXISTS "lesson_progress_user_lesson_unique_idx"
  ON "lesson_progress" ("user_id", "lesson_id");

CREATE INDEX IF NOT EXISTS "lesson_progress_user_id_idx"
  ON "lesson_progress" ("user_id");

CREATE INDEX IF NOT EXISTS "lesson_progress_lesson_id_idx"
  ON "lesson_progress" ("lesson_id");

CREATE UNIQUE INDEX IF NOT EXISTS "course_certificates_user_course_unique_idx"
  ON "course_certificates" ("user_id", "course_id");

CREATE INDEX IF NOT EXISTS "course_certificates_user_id_idx"
  ON "course_certificates" ("user_id");

CREATE INDEX IF NOT EXISTS "course_certificates_course_id_idx"
  ON "course_certificates" ("course_id");

CREATE UNIQUE INDEX IF NOT EXISTS "course_reviews_user_course_unique_idx"
  ON "course_reviews" ("user_id", "course_id");

CREATE INDEX IF NOT EXISTS "course_reviews_course_id_idx"
  ON "course_reviews" ("course_id");
