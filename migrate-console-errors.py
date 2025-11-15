#!/usr/bin/env python3
import re
import os
from pathlib import Path

# Liste des fichiers à migrer
files_to_migrate = [
    "app/admin/events/[id]/accommodation/[accommodationId]/page.tsx",
    "app/admin/events/[id]/accommodation/page.tsx",
    "app/admin/events/[id]/activites-libres/page.tsx",
    "app/admin/events/[id]/analytics-pro/page.tsx",
    "app/admin/events/[id]/ateliers/page.tsx",
    "app/admin/events/[id]/checkin/page.tsx",
    "app/admin/events/[id]/communications/page.tsx",
    "app/admin/events/[id]/email-analytics/page.tsx",
    "app/admin/events/[id]/email-editor/page.tsx",
    "app/admin/events/[id]/guests/page.tsx",
    "app/admin/events/[id]/invitation/page.tsx",
    "app/admin/events/[id]/kiosk/page.tsx",
    "app/admin/events/[id]/layout.tsx",
    "app/admin/events/[id]/operations/page.tsx",
    "app/admin/events/[id]/page.tsx",
    "app/admin/events/[id]/program/page.tsx",
    "app/admin/events/[id]/rsvp-config/page.tsx",
    "app/admin/events/[id]/save-the-date/page.tsx",
    "app/admin/events/[id]/showcase/page.tsx",
    "app/admin/events/[id]/team-building/page.tsx",
    "app/admin/events/[id]/timeline/page.tsx",
    "app/admin/events/[id]/transport/arrivals/page.tsx",
    "app/admin/events/[id]/transport/page.tsx",
    "app/admin/events/new/page.tsx",
    "app/admin/events/page.tsx",
    "app/admin/rsvp/page.tsx",
    "app/admin/system/page.tsx",
    "app/admin/users/page.tsx",
    "app/event/[slug]/page.tsx",
]

def get_component_name(filepath):
    """Extract component name from file path"""
    parts = Path(filepath).parts
    # Get the last meaningful part before page.tsx or layout.tsx
    if 'page.tsx' in filepath or 'layout.tsx' in filepath:
        # For app/admin/events/[id]/program/page.tsx -> ProgramPage
        relevant_parts = [p for p in parts if not p.startswith('[') and p not in ['app', 'admin', 'events']]
        if relevant_parts and relevant_parts[-1] in ['page.tsx', 'layout.tsx']:
            relevant_parts = relevant_parts[:-1]
        if relevant_parts:
            name = ''.join(word.capitalize() for word in relevant_parts[-1].replace('-', '_').split('_'))
            return name + ('Layout' if 'layout.tsx' in filepath else 'Page')
    return 'Page'

def extract_action_from_error_message(error_msg):
    """Extract action name from error message"""
    # Remove quotes and common prefixes
    cleaned = error_msg.replace("'", "").replace('"', "").replace("Error ", "").replace("error ", "")
    # Handle patterns like "Error fetching data:" -> "fetchData"
    words = cleaned.replace(":", "").split()
    if len(words) >= 2:
        # "fetching data" -> "fetchData"
        action = words[0] + ''.join(word.capitalize() for word in words[1:])
        return action
    return cleaned or "unknownAction"

def migrate_file(filepath):
    """Migrate a single file"""
    print(f"Migrating {filepath}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already migrated
    if 'createClientLogger' in content:
        print(f"  ✓ Already migrated")
        return False

    # Get component name
    component_name = get_component_name(filepath)

    # Find the last import statement
    import_pattern = r'^import .+$'
    imports = list(re.finditer(import_pattern, content, re.MULTILINE))

    if not imports:
        print(f"  ✗ No imports found")
        return False

    last_import = imports[-1]
    insert_pos = last_import.end()

    # Add logger import and initialization
    logger_import = f"\nimport {{ createClientLogger }} from '@/lib/client-logger'\n\nconst logger = createClientLogger({{ component: '{component_name}' }})\n"
    content = content[:insert_pos] + logger_import + content[insert_pos:]

    # Find and replace all console.error calls
    console_error_pattern = r"console\.error\(['\"]([^'\"]+)['\"],\s*error\)"

    def replace_console_error(match):
        error_msg = match.group(1)
        action = extract_action_from_error_message(error_msg)
        return f"logger.error(error, {{ action: '{action}' }})"

    content, num_replacements = re.subn(console_error_pattern, replace_console_error, content)

    # Also handle console.error with different patterns
    # Pattern: console.error('message', error)
    # Pattern: console.error(error)
    simple_pattern = r"console\.error\(error\)"
    content = re.sub(simple_pattern, "logger.error(error, { action: 'unknownError' })", content)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"  ✓ Migrated with {num_replacements} replacements")
    return True

# Migrate all files
migrated_count = 0
for filepath in files_to_migrate:
    if os.path.exists(filepath):
        if migrate_file(filepath):
            migrated_count += 1
    else:
        print(f"File not found: {filepath}")

print(f"\nTotal files migrated: {migrated_count}/{len(files_to_migrate)}")
