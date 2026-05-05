-- Quiz system tables

DO $$ BEGIN
  CREATE TYPE "quiz_question_type" AS ENUM ('multiple_choice', 'true_false', 'multi_select');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "quizzes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE CASCADE,
  "lesson_id" uuid REFERENCES "course_lessons"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "description" text,
  "passing_score" integer NOT NULL DEFAULT 70,
  "time_limit_minutes" integer,
  "max_attempts" integer,
  "is_published" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "quiz_questions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "quiz_id" uuid NOT NULL REFERENCES "quizzes"("id") ON DELETE CASCADE,
  "question_text" text NOT NULL,
  "question_type" "quiz_question_type" NOT NULL DEFAULT 'multiple_choice',
  "points" integer NOT NULL DEFAULT 1,
  "position" integer NOT NULL,
  "explanation" text
);

CREATE TABLE IF NOT EXISTS "quiz_options" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "question_id" uuid NOT NULL REFERENCES "quiz_questions"("id") ON DELETE CASCADE,
  "option_text" text NOT NULL,
  "is_correct" boolean NOT NULL DEFAULT false,
  "position" integer NOT NULL
);

CREATE TABLE IF NOT EXISTS "quiz_attempts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "quiz_id" uuid NOT NULL REFERENCES "quizzes"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "score" integer,
  "total_points" integer,
  "passed" boolean,
  "started_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp
);

CREATE TABLE IF NOT EXISTS "quiz_answers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "attempt_id" uuid NOT NULL REFERENCES "quiz_attempts"("id") ON DELETE CASCADE,
  "question_id" uuid NOT NULL REFERENCES "quiz_questions"("id") ON DELETE CASCADE,
  "selected_option_ids" text[] NOT NULL DEFAULT '{}',
  "is_correct" boolean,
  "points_awarded" integer NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "idx_quizzes_course" ON "quizzes"("course_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_questions_quiz" ON "quiz_questions"("quiz_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_options_question" ON "quiz_options"("question_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_attempts_user_quiz" ON "quiz_attempts"("user_id", "quiz_id");
CREATE INDEX IF NOT EXISTS "idx_quiz_answers_attempt" ON "quiz_answers"("attempt_id");
