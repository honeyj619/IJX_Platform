import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export async function writeFilesAtomically(changes) {
  const unique = new Map(changes.map((change) => [path.resolve(change.filePath), change.content]));
  const transactionId = randomUUID();
  const prepared = [];
  const committed = [];

  try {
    for (const [filePath, content] of unique) {
      const temporaryPath = `${filePath}.${transactionId}.tmp`;
      const backupPath = `${filePath}.${transactionId}.bak`;
      await fs.writeFile(temporaryPath, content, 'utf8');
      prepared.push({ filePath, temporaryPath, backupPath });
    }
    for (const item of prepared) {
      await fs.rename(item.filePath, item.backupPath);
      try {
        await fs.rename(item.temporaryPath, item.filePath);
        committed.push(item);
      } catch (error) {
        await fs.rename(item.backupPath, item.filePath);
        throw error;
      }
    }
    await Promise.all(committed.map((item) => fs.rm(item.backupPath, { force: true }).catch(() => {})));
  } catch (error) {
    for (const item of committed.reverse()) {
      await fs.rm(item.filePath, { force: true }).catch(() => {});
      await fs.rename(item.backupPath, item.filePath).catch(() => {});
    }
    throw error;
  } finally {
    await Promise.all(prepared.flatMap((item) => [
      fs.rm(item.temporaryPath, { force: true }).catch(() => {}),
      fs.rm(item.backupPath, { force: true }).catch(() => {}),
    ]));
  }
}
