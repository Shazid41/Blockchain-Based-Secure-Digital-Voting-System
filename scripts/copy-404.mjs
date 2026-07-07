import { copyFileSync } from 'node:fs';
import { join } from 'node:path';

copyFileSync(join('dist', 'index.html'), join('dist', '404.html'));
