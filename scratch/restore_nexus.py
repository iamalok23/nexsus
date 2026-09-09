"""Script to restore the nexus frontend from conversation logs."""
import os
import json
import re

LOG_FB = r'C:\Users\Nityam Jaiswal\.gemini\antigravity\brain\fb69bf55-26d8-4420-a8a5-e461b2943c07\.system_generated\logs\transcript_full.jsonl'
LOG_CURRENT = r'C:\Users\Nityam Jaiswal\.gemini\antigravity\brain\296415ce-8ed0-4b1c-b8ba-a547de0a4137\.system_generated\logs\transcript_full.jsonl'

nexus_files = {}

# 1. Extract all write_to_file in LOG_FB
with open(LOG_FB, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        for tc in data.get('tool_calls', []):
            if tc.get('name') == 'write_to_file':
                args = tc.get('args', {})
                tf = args.get('TargetFile')
                content = args.get('CodeContent')
                if tf and content and 'nexus' in tf:
                    nexus_files[tf] = content

# 2. Extract files viewed in full in LOG_FB or LOG_CURRENT (e.g. package.json, index.html, tailwind.config.js, tsconfig.app.json, main.tsx, index.css)
def extract_viewed_file(log_path, target_pattern):
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            data = json.loads(line)
            content = data.get('content', '')
            if target_pattern in content and 'The following code has been modified to include a line number' in content:
                # Extract file contents by stripping line numbers
                lines = []
                capture = False
                for cl in content.split('\n'):
                    if 'Showing lines 1 to' in cl:
                        capture = True
                        continue
                    if 'The above content' in cl:
                        capture = False
                        break
                    if capture:
                        m = re.match(r'^\s*\d+:\s?(.*)$', cl)
                        if m:
                            lines.append(m.group(1))
                if lines:
                    return '\n'.join(lines)
    return None

# Find base files
for fname, pattern in [
    ('package.json', 'package.json'),
    ('index.html', 'index.html'),
    ('tailwind.config.js', 'tailwind.config.js'),
    ('tsconfig.app.json', 'tsconfig.app.json'),
    ('src/main.tsx', 'main.tsx'),
    ('src/index.css', 'index.css'),
]:
    target_path = os.path.join(r'C:\Users\Nityam Jaiswal\.gemini\antigravity\scratch\nexus', fname.replace('/', os.sep))
    if target_path not in nexus_files:
        content = extract_viewed_file(LOG_CURRENT, pattern) or extract_viewed_file(LOG_FB, pattern)
        if content:
            nexus_files[target_path] = content
            print(f"Recovered {fname} from view logs ({len(content)} bytes)")

# 3. Apply writes and edits from LOG_CURRENT (api.ts, ApiStatusBanner.tsx, and updated pages)
with open(LOG_CURRENT, 'r', encoding='utf-8') as f:
    for line in f:
        data = json.loads(line)
        for tc in data.get('tool_calls', []):
            if tc.get('name') == 'write_to_file':
                args = tc.get('args', {})
                tf = args.get('TargetFile')
                content = args.get('CodeContent')
                if tf and content and 'nexus' in tf:
                    nexus_files[tf] = content
                    print(f"Updated {os.path.basename(tf)} from current log write_to_file")

# 4. Standard boilerplate for tsconfig.json, tsconfig.node.json, postcss.config.js, App.css if missing
p_root = r'C:\Users\Nityam Jaiswal\.gemini\antigravity\scratch\nexus'

if os.path.join(p_root, 'tsconfig.json') not in nexus_files:
    nexus_files[os.path.join(p_root, 'tsconfig.json')] = json.dumps({
        "files": [],
        "references": [
            { "path": "./tsconfig.app.json" },
            { "path": "./tsconfig.node.json" }
        ]
    }, indent=2)

if os.path.join(p_root, 'tsconfig.node.json') not in nexus_files:
    nexus_files[os.path.join(p_root, 'tsconfig.node.json')] = json.dumps({
        "compilerOptions": {
            "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
            "target": "ES2022",
            "lib": ["ES2023"],
            "module": "ESNext",
            "skipLibCheck": True,
            "moduleResolution": "bundler",
            "isolatedModules": True,
            "moduleDetection": "force",
            "noEmit": True,
            "strict": True,
            "noUnusedLocals": True,
            "noUnusedParameters": True,
            "noFallthroughCasesInSwitch": True
        },
        "include": ["vite.config.ts"]
    }, indent=2)

if os.path.join(p_root, 'postcss.config.js') not in nexus_files:
    nexus_files[os.path.join(p_root, 'postcss.config.js')] = "export default {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n}\n"

if os.path.join(p_root, 'src', 'App.css') not in nexus_files:
    nexus_files[os.path.join(p_root, 'src', 'App.css')] = "/* App styles */\n"

# 5. Write all files to disk
print(f"\nWriting {len(nexus_files)} files to {p_root}...")
for fpath, fcontent in nexus_files.items():
    os.makedirs(os.path.dirname(fpath), exist_ok=True)
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(fcontent)
    print(f"  [OK] {os.path.relpath(fpath, p_root)}")

print("\nRestoration of nexus completed successfully!")
