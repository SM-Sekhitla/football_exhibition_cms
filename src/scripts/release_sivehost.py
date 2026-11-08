#!/usr/bin/env python3
"""Build a production frontend ZIP for manual promotion from preview to cPanel."""
import json
import os
from pathlib import Path
import subprocess
from datetime import datetime, timezone
from zipfile import ZipFile, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parents[1]

def git(*args):
    result = subprocess.run(['git', *args], cwd=ROOT, capture_output=True, text=True)
    return result.stdout.strip() if result.returncode == 0 else ''

def main():
    revision = git('rev-parse', '--short', 'HEAD') or 'local'
    dirty = bool(git('status', '--porcelain'))
    build_version = revision + ('-modified' if dirty else '')
    # Pin the production target even if the shell has Vercel/local VITE_* overrides.
    environment = dict(os.environ)
    for line in (ROOT / '.env.sivehost').read_text().splitlines():
        if line.strip() and not line.lstrip().startswith('#'):
            key, value = line.split('=', 1)
            environment[key.strip()] = value.strip()
    environment['VITE_GIT_VERSION'] = build_version
    subprocess.run(['npm', 'run', 'build:sivehost'], cwd=ROOT, env=environment, check=True)
    output = ROOT / 'dist'
    if not (output / '.htaccess').is_file():
        raise RuntimeError('Missing cPanel routing file')
    stamp = datetime.now(timezone.utc)
    release = {'version': build_version, 'builtAt': stamp.isoformat(), 'target': environment['VITE_API_URL']}
    (output / 'release.json').write_text(json.dumps(release, indent=2)+'\n')
    releases = ROOT.parent / 'releases'
    releases.mkdir(exist_ok=True)
    archive = releases / f'best5-sivehost-{stamp:%Y%m%dT%H%M%S%fZ}-{build_version}.zip'
    with ZipFile(archive, 'w', ZIP_DEFLATED) as package:
        for path in output.rglob('*'):
            if path.is_file():
                package.write(path, path.relative_to(output))
    print(f'\nRelease ready: {archive}\nUpload and extract its contents in your cPanel document root. Nothing was published automatically.')
    if dirty:
        print('This archive includes uncommitted local changes; its version is marked modified.')

if __name__ == '__main__':
    main()
