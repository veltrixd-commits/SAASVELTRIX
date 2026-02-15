import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface IdeaRecord {
  id: string;
  title: string;
  audioBlob: string;
  duration: number;
  createdAt: string;
  category: string;
  notes?: string;
  transcript?: string;
  tags?: string[];
  linkedTask?: string;
  shareToken?: string;
}

const ideasFilePath = path.join(process.cwd(), 'data', 'ideas.json');

async function readIdeas(): Promise<IdeaRecord[]> {
  try {
    const raw = await fs.readFile(ideasFilePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(path.dirname(ideasFilePath), { recursive: true });
      await fs.writeFile(ideasFilePath, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
}

async function saveIdeas(ideas: IdeaRecord[]) {
  await fs.writeFile(ideasFilePath, JSON.stringify(ideas, null, 2), 'utf-8');
}

export async function GET() {
  const ideas = await readIdeas();
  const sorted = ideas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ ideas: sorted });
}

export async function POST(request: Request) {
  const payload = await request.json();

  if (!payload?.title || !payload?.audioBlob) {
    return NextResponse.json({ error: 'Missing title or audioBlob' }, { status: 400 });
  }

  const ideas = await readIdeas();

  const newIdea: IdeaRecord = {
    id: crypto.randomUUID(),
    title: payload.title,
    audioBlob: payload.audioBlob,
    duration: Number(payload.duration) || 0,
    createdAt: new Date().toISOString(),
    category: payload.category || 'general',
    notes: payload.notes || undefined,
    transcript: payload.transcript || undefined,
    tags: Array.isArray(payload.tags) ? payload.tags : undefined,
    linkedTask: payload.linkedTask || undefined,
    shareToken: payload.shareToken || crypto.randomUUID(),
  };

  const nextIdeas = [newIdea, ...ideas];
  await saveIdeas(nextIdeas);

  return NextResponse.json({ idea: newIdea }, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Missing idea id' }, { status: 400 });
  }

  const ideas = await readIdeas();
  const nextIdeas = ideas.filter((idea) => idea.id !== id);

  if (nextIdeas.length === ideas.length) {
    return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
  }

  await saveIdeas(nextIdeas);
  return NextResponse.json({ success: true });
}
