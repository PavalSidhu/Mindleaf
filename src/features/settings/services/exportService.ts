import { db } from '@/db/database';
import { format } from 'date-fns';

// Export all data as JSON
export async function exportJSON(): Promise<string> {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    books: await db.books.toArray(),
    readingSessions: await db.readingSessions.toArray(),
    journalEntries: await db.journalEntries.toArray(),
    moodEntries: await db.moodEntries.toArray(),
    goals: await db.goals.toArray(),
    achievements: await db.achievements.toArray(),
    tags: await db.tags.toArray()
  };

  return JSON.stringify(data, null, 2);
}

// Export moods as CSV
export async function exportMoodsCSV(): Promise<string> {
  const moods = await db.moodEntries.orderBy('timestamp').toArray();

  const headers = ['Date', 'Time', 'Mood Level', 'Emotions', 'Activities', 'Note'];
  const rows = moods.map((mood) => [
    format(mood.timestamp, 'yyyy-MM-dd'),
    format(mood.timestamp, 'HH:mm'),
    mood.moodLevel.toString(),
    mood.specificEmotions.join('; '),
    mood.activityTags.join('; '),
    mood.note ? `"${mood.note.replace(/"/g, '""')}"` : ''
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Export reading sessions as CSV
export async function exportSessionsCSV(): Promise<string> {
  const sessions = await db.readingSessions.orderBy('startTime').toArray();
  const books = await db.books.toArray();
  const bookMap = new Map(books.map((b) => [b.id, b]));

  const headers = [
    'Date',
    'Book Title',
    'Author',
    'Duration (min)',
    'Pages Read',
    'Mood Before',
    'Mood After',
    'Quotes Count'
  ];

  const rows = sessions.map((session) => {
    const book = bookMap.get(session.bookId);
    return [
      format(session.startTime, 'yyyy-MM-dd'),
      book ? `"${book.title.replace(/"/g, '""')}"` : 'Unknown',
      book ? `"${book.author.replace(/"/g, '""')}"` : 'Unknown',
      Math.round(session.duration / 60).toString(),
      session.pagesRead.toString(),
      session.moodBefore?.toString() || '',
      session.moodAfter?.toString() || '',
      session.quotes.length.toString()
    ];
  });

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

// Export journal entries as PDF (requires html2pdf.js)
export async function exportJournalPDF(entryIds?: string[]): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;

  let entries = await db.journalEntries
    .filter((e) => !e.isDraft)
    .toArray();

  if (entryIds && entryIds.length > 0) {
    entries = entries.filter((e) => entryIds.includes(e.id));
  }

  entries.sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());

  // Build HTML content
  const content = entries
    .map(
      (entry) => `
      <div style="page-break-after: always; margin-bottom: 40px;">
        <div style="color: #737373; font-size: 12px; margin-bottom: 16px;">
          ${format(entry.dateCreated, 'MMMM d, yyyy')}
        </div>
        <div style="font-size: 14px; line-height: 1.6;">
          ${entry.content}
        </div>
        ${
          entry.tags.length > 0
            ? `
          <div style="margin-top: 16px; color: #737373; font-size: 12px;">
            Tags: ${entry.tags.join(', ')}
          </div>
        `
            : ''
        }
      </div>
    `
    )
    .join('');

  const container = document.createElement('div');
  container.innerHTML = `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; padding: 40px;">
      <h1 style="font-size: 24px; margin-bottom: 40px; text-align: center;">
        My Journal
      </h1>
      ${content}
    </div>
  `;

  const options = {
    margin: 10,
    filename: `mindleaf-journal-${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await html2pdf().set(options).from(container).save();
}

// Download helper
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
