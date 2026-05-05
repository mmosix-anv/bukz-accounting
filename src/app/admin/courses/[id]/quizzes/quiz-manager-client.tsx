'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Accordion,
  ActionIcon,
  Badge,
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { Plus, Trash2, GripVertical, CheckCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

interface Option { id: string; optionText: string; isCorrect: boolean; position: number }
interface Question { id: string; questionText: string; questionType: string; points: number; position: number; explanation: string | null; options: Option[] }
interface Quiz { id: string; title: string; description: string | null; passingScore: number; timeLimitMinutes: number | null; maxAttempts: number | null; isPublished: boolean; questions: Question[] }

const emptyQForm = () => ({
  questionText: '', questionType: 'multiple_choice' as string, points: 1, explanation: '',
  options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }],
});

export function QuizManagerClient({ courseId, quizzes, token }: { courseId: string; quizzes: Quiz[]; token: string | undefined }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [qForm, setQForm] = useState(emptyQForm());

  async function createQuiz() {
    if (!newTitle.trim()) return;
    setCreating(true);
    await apiFetch(`/learn/courses/${courseId}/quizzes`, { method: 'POST', token, body: JSON.stringify({ title: newTitle }) }).catch(() => null);
    setCreating(false);
    setNewTitle('');
    router.refresh();
  }

  async function togglePublish(quiz: Quiz) {
    if (!quiz.isPublished) {
      await apiFetch(`/learn/quizzes/${quiz.id}/publish`, { method: 'POST', token }).catch(() => null);
    } else {
      await apiFetch(`/learn/quizzes/${quiz.id}`, { method: 'PATCH', token, body: JSON.stringify({ isPublished: false }) }).catch(() => null);
    }
    router.refresh();
  }

  async function deleteQuiz(quizId: string) {
    if (!confirm('Delete this quiz and all its questions?')) return;
    await apiFetch(`/learn/quizzes/${quizId}`, { method: 'DELETE', token }).catch(() => null);
    router.refresh();
  }

  async function deleteQuestion(questionId: string) {
    await apiFetch(`/learn/quizzes/_/questions/${questionId}`, { method: 'DELETE', token }).catch(() => null);
    router.refresh();
  }

  async function submitQuestion(quizId: string) {
    if (!qForm.questionText.trim()) return;
    await apiFetch(`/learn/quizzes/${quizId}/questions`, {
      method: 'POST', token,
      body: JSON.stringify({
        questionText: qForm.questionText,
        questionType: qForm.questionType,
        points: qForm.points,
        explanation: qForm.explanation || undefined,
        options: qForm.options.filter((o) => o.optionText.trim()),
      }),
    }).catch(() => null);
    setAddingTo(null);
    setQForm(emptyQForm());
    router.refresh();
  }

  function updateOption(idx: number, field: 'optionText' | 'isCorrect', value: string | boolean) {
    setQForm((prev) => ({
      ...prev,
      options: prev.options.map((o, i) => i === idx ? { ...o, [field]: value } : field === 'isCorrect' && prev.questionType !== 'multi_select' ? { ...o, isCorrect: false } : o),
    }));
  }

  return (
    <Stack gap="lg">
      <Card withBorder radius="xl" p="lg" className="shadow-soft">
        <Title order={3} size="h4" mb="md">Create Quiz</Title>
        <Group>
          <TextInput placeholder="Quiz title" value={newTitle} onChange={(e) => setNewTitle(e.currentTarget.value)} flex={1} />
          <Button onClick={() => void createQuiz()} loading={creating}>Create</Button>
        </Group>
      </Card>

      {quizzes.map((quiz) => (
        <Card key={quiz.id} withBorder radius="xl" p="lg" className="shadow-soft">
          <Group justify="space-between" mb="md">
            <Group gap="sm">
              <Title order={3} size="h4" c="primary.7">{quiz.title}</Title>
              <Badge color={quiz.isPublished ? 'green' : 'gray'} variant="light">{quiz.isPublished ? 'Published' : 'Draft'}</Badge>
            </Group>
            <Group gap="xs">
              <Button size="xs" variant="light" onClick={() => void togglePublish(quiz)}>{quiz.isPublished ? 'Unpublish' : 'Publish'}</Button>
              <ActionIcon color="red" variant="light" onClick={() => void deleteQuiz(quiz.id)}><Trash2 size={14} /></ActionIcon>
            </Group>
          </Group>

          <Group gap="lg" mb="md">
            <Text size="xs" c="dimmed">Pass: {quiz.passingScore}%</Text>
            <Text size="xs" c="dimmed">Time: {quiz.timeLimitMinutes ?? '∞'} min</Text>
            <Text size="xs" c="dimmed">Attempts: {quiz.maxAttempts ?? '∞'}</Text>
            <Text size="xs" c="dimmed">{quiz.questions.length} questions</Text>
          </Group>

          {quiz.questions.length > 0 && (
            <Accordion variant="separated" radius="md" mb="md">
              {quiz.questions.map((q) => (
                <Accordion.Item key={q.id} value={q.id}>
                  <Accordion.Control>
                    <Group gap="sm" wrap="nowrap">
                      <GripVertical size={14} className="text-slate-400" />
                      <Badge size="xs" variant="light">{q.points}pt</Badge>
                      <Text size="sm" truncate flex={1}>{q.questionText}</Text>
                    </Group>
                  </Accordion.Control>
                  <Accordion.Panel>
                    <Stack gap="xs">
                      {q.options.map((o) => (
                        <Group key={o.id} gap="sm">
                          {o.isCorrect ? <CheckCircle size={14} className="text-emerald-500" /> : <div className="h-3.5 w-3.5 rounded-full border border-slate-300" />}
                          <Text size="sm" c={o.isCorrect ? 'green.7' : undefined}>{o.optionText}</Text>
                        </Group>
                      ))}
                      {q.explanation && <Text size="xs" c="dimmed" mt="xs">Explanation: {q.explanation}</Text>}
                      <Group justify="flex-end">
                        <Button size="xs" color="red" variant="subtle" onClick={() => void deleteQuestion(q.id)}>Delete</Button>
                      </Group>
                    </Stack>
                  </Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          )}

          {addingTo === quiz.id ? (
            <Card withBorder radius="md" p="md" bg="slate.0">
              <Stack gap="sm">
                <Textarea label="Question" value={qForm.questionText} onChange={(e) => setQForm((p) => ({ ...p, questionText: e.currentTarget.value }))} required autosize minRows={2} />
                <Group grow>
                  <Select label="Type" value={qForm.questionType} onChange={(v) => setQForm((p) => ({ ...p, questionType: v ?? 'multiple_choice' }))} data={[{ value: 'multiple_choice', label: 'Multiple Choice' }, { value: 'true_false', label: 'True / False' }, { value: 'multi_select', label: 'Multi Select' }]} />
                  <NumberInput label="Points" value={qForm.points} onChange={(v) => setQForm((p) => ({ ...p, points: typeof v === 'number' ? v : 1 }))} min={1} />
                </Group>
                <TextInput label="Explanation (optional)" value={qForm.explanation} onChange={(e) => setQForm((p) => ({ ...p, explanation: e.currentTarget.value }))} />
                <Text size="sm" fw={600}>Options</Text>
                {qForm.options.map((o, i) => (
                  <Group key={i} gap="sm">
                    <input type={qForm.questionType === 'multi_select' ? 'checkbox' : 'radio'} name="correct" checked={o.isCorrect} onChange={() => updateOption(i, 'isCorrect', !o.isCorrect)} />
                    <TextInput placeholder={`Option ${i + 1}`} value={o.optionText} onChange={(e) => updateOption(i, 'optionText', e.currentTarget.value)} flex={1} />
                    {qForm.options.length > 2 && (
                      <ActionIcon color="red" variant="subtle" onClick={() => setQForm((p) => ({ ...p, options: p.options.filter((_, j) => j !== i) }))}><Trash2 size={12} /></ActionIcon>
                    )}
                  </Group>
                ))}
                <Button size="xs" variant="subtle" leftSection={<Plus size={12} />} onClick={() => setQForm((p) => ({ ...p, options: [...p.options, { optionText: '', isCorrect: false }] }))}>
                  Add option
                </Button>
                <Group justify="flex-end">
                  <Button variant="default" size="sm" onClick={() => { setAddingTo(null); setQForm(emptyQForm()); }}>Cancel</Button>
                  <Button size="sm" onClick={() => void submitQuestion(quiz.id)}>Save Question</Button>
                </Group>
              </Stack>
            </Card>
          ) : (
            <Button variant="light" leftSection={<Plus size={14} />} onClick={() => setAddingTo(quiz.id)}>Add Question</Button>
          )}
        </Card>
      ))}
    </Stack>
  );
}
