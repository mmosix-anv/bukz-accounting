import { db } from '@/lib/db';
import { quizzes, quizQuestions, quizOptions, quizAttempts, quizAnswers, enrollments } from '@bukz/db';
import { eq, and, desc, asc, sql, count } from 'drizzle-orm';

export async function createQuiz(courseId: string, data: { title: string; description?: string; lessonId?: string; passingScore?: number; timeLimitMinutes?: number; maxAttempts?: number }) {
  const [quiz] = await db.insert(quizzes).values({ courseId, ...data }).returning();
  return quiz!;
}

export async function updateQuiz(quizId: string, data: Partial<typeof quizzes.$inferInsert>) {
  const [quiz] = await db.update(quizzes).set({ ...data, updatedAt: new Date() }).where(eq(quizzes.id, quizId)).returning();
  if (!quiz) throw new Error('Quiz not found');
  return quiz;
}

export async function deleteQuiz(quizId: string) {
  await db.delete(quizzes).where(eq(quizzes.id, quizId));
  return { deleted: true };
}

export async function publishQuiz(quizId: string) {
  const questions = await db.select({ id: quizQuestions.id }).from(quizQuestions).where(eq(quizQuestions.quizId, quizId));
  if (questions.length === 0) throw new Error('Quiz must have at least one question');
  const [quiz] = await db.update(quizzes).set({ isPublished: true, updatedAt: new Date() }).where(eq(quizzes.id, quizId)).returning();
  return quiz!;
}

export async function getQuizzesByCourse(courseId: string) {
  return db.select().from(quizzes).where(eq(quizzes.courseId, courseId)).orderBy(asc(quizzes.createdAt));
}

export async function getQuizWithQuestions(quizId: string, includeCorrect = false) {
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (!quiz) throw new Error('Quiz not found');

  const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quizId)).orderBy(asc(quizQuestions.position));
  const qIds = questions.map((q) => q.id);

  const options = qIds.length > 0
    ? await db.select().from(quizOptions).where(sql`${quizOptions.questionId} IN (${sql.join(qIds.map((id) => sql`${id}`), sql`, `)})`)
        .orderBy(asc(quizOptions.position))
    : [];

  return {
    ...quiz,
    questions: questions.map((q) => ({
      ...q,
      options: options
        .filter((o) => o.questionId === q.id)
        .map((o) => includeCorrect ? o : { id: o.id, questionId: o.questionId, optionText: o.optionText, position: o.position }),
    })),
  };
}

export async function addQuestion(quizId: string, data: { questionText: string; questionType?: 'multiple_choice' | 'true_false' | 'multi_select'; points?: number; explanation?: string; options: { optionText: string; isCorrect: boolean }[] }) {
  const [last] = await db.select({ position: quizQuestions.position }).from(quizQuestions)
    .where(eq(quizQuestions.quizId, quizId)).orderBy(desc(quizQuestions.position)).limit(1);

  const [question] = await db.insert(quizQuestions).values({
    quizId,
    questionText: data.questionText,
    questionType: data.questionType ?? 'multiple_choice',
    points: data.points ?? 1,
    position: (last?.position ?? 0) + 1,
    explanation: data.explanation,
  }).returning();

  if (data.options.length > 0) {
    await db.insert(quizOptions).values(
      data.options.map((o, i) => ({
        questionId: question!.id,
        optionText: o.optionText,
        isCorrect: o.isCorrect,
        position: i + 1,
      })),
    );
  }

  return question!;
}

export async function updateQuestion(questionId: string, data: { questionText?: string; questionType?: 'multiple_choice' | 'true_false' | 'multi_select'; points?: number; explanation?: string }) {
  const [q] = await db.update(quizQuestions).set(data).where(eq(quizQuestions.id, questionId)).returning();
  if (!q) throw new Error('Question not found');
  return q;
}

export async function deleteQuestion(questionId: string) {
  await db.delete(quizQuestions).where(eq(quizQuestions.id, questionId));
  return { deleted: true };
}

export async function replaceOptions(questionId: string, options: { optionText: string; isCorrect: boolean }[]) {
  await db.delete(quizOptions).where(eq(quizOptions.questionId, questionId));
  if (options.length > 0) {
    await db.insert(quizOptions).values(
      options.map((o, i) => ({ questionId, optionText: o.optionText, isCorrect: o.isCorrect, position: i + 1 })),
    );
  }
  return { replaced: true };
}

export async function startAttempt(userId: string, quizId: string) {
  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
  if (!quiz) throw new Error('Quiz not found');
  if (!quiz.isPublished) throw new Error('Quiz is not published');

  const [enrollment] = await db.select({ id: enrollments.id }).from(enrollments)
    .where(and(eq(enrollments.userId, userId), eq(enrollments.courseId, quiz.courseId))).limit(1);
  if (!enrollment) throw new Error('You must be enrolled in this course');

  if (quiz.maxAttempts) {
    const result = await db.select({ count: count() }).from(quizAttempts)
      .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)));
    if (Number(result[0]?.count ?? 0) >= quiz.maxAttempts) throw new Error('Maximum attempts reached');
  }

  const [attempt] = await db.insert(quizAttempts).values({ quizId, userId }).returning();
  return attempt!;
}

export async function submitAttempt(attemptId: string, userId: string, answers: { questionId: string; selectedOptionIds: string[] }[]) {
  const [attempt] = await db.select().from(quizAttempts).where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId))).limit(1);
  if (!attempt) throw new Error('Attempt not found');
  if (attempt.completedAt) throw new Error('Attempt already submitted');

  const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, attempt.quizId)).limit(1);
  if (!quiz) throw new Error('Quiz not found');

  const questions = await db.select().from(quizQuestions).where(eq(quizQuestions.quizId, quiz.id));
  const allOptions = await db.select().from(quizOptions)
    .where(sql`${quizOptions.questionId} IN (${sql.join(questions.map((q) => sql`${q.id}`), sql`, `)})`);

  let totalScore = 0;
  let totalPoints = 0;
  const answerRows: (typeof quizAnswers.$inferInsert)[] = [];

  for (const q of questions) {
    totalPoints += q.points;
    const answer = answers.find((a) => a.questionId === q.id);
    const correctIds = allOptions.filter((o) => o.questionId === q.id && o.isCorrect).map((o) => o.id).sort();
    const selectedIds = (answer?.selectedOptionIds ?? []).sort();

    const isCorrect = correctIds.length === selectedIds.length && correctIds.every((id, i) => id === selectedIds[i]);
    const pts = isCorrect ? q.points : 0;
    totalScore += pts;

    answerRows.push({
      attemptId,
      questionId: q.id,
      selectedOptionIds: answer?.selectedOptionIds ?? [],
      isCorrect,
      pointsAwarded: pts,
    });
  }

  if (answerRows.length > 0) {
    await db.insert(quizAnswers).values(answerRows);
  }

  const scorePercent = totalPoints > 0 ? Math.round((totalScore / totalPoints) * 100) : 0;
  const passed = scorePercent >= quiz.passingScore;

  const [completed] = await db.update(quizAttempts).set({
    score: totalScore,
    totalPoints,
    passed,
    completedAt: new Date(),
  }).where(eq(quizAttempts.id, attemptId)).returning();

  return completed!;
}

export async function getAttemptResults(attemptId: string, userId: string) {
  const [attempt] = await db.select().from(quizAttempts).where(and(eq(quizAttempts.id, attemptId), eq(quizAttempts.userId, userId))).limit(1);
  if (!attempt) throw new Error('Attempt not found');

  const answers = await db.select().from(quizAnswers).where(eq(quizAnswers.attemptId, attemptId));
  const questionIds = answers.map((a) => a.questionId);
  const questions = questionIds.length > 0
    ? await db.select().from(quizQuestions).where(sql`${quizQuestions.id} IN (${sql.join(questionIds.map((id) => sql`${id}`), sql`, `)})`)
    : [];
  const options = questionIds.length > 0
    ? await db.select().from(quizOptions).where(sql`${quizOptions.questionId} IN (${sql.join(questionIds.map((id) => sql`${id}`), sql`, `)})`)
    : [];

  return {
    ...attempt,
    answers: answers.map((a) => {
      const q = questions.find((q) => q.id === a.questionId);
      const opts = options.filter((o) => o.questionId === a.questionId);
      return { ...a, question: q, options: opts };
    }),
  };
}

export async function getUserAttempts(userId: string, quizId: string) {
  return db.select().from(quizAttempts)
    .where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.quizId, quizId)))
    .orderBy(desc(quizAttempts.startedAt));
}
