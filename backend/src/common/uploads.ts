import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';

const DEFAULT_UPLOAD_DIR = join(process.cwd(), 'uploads');

export function getUploadDir() {
  const dir = process.env.UPLOAD_DIR
    ? resolve(process.env.UPLOAD_DIR)
    : DEFAULT_UPLOAD_DIR;

  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  return dir;
}
