#!/usr/bin/env python3
"""
Memory Reflection Script for OpenClaw

This script distills daily memory logs into structured ## Retain sections
and updates bank/entity pages with extracted facts.

Usage:
    python3 reflect.py --workspace ~/.openclaw/workspace
"""

import argparse
import re
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Dict, Tuple, Optional, cast
import json

class MemoryReflector:
    """Handles reflection and distillation of OpenClaw memory files."""
    
    def __init__(self, workspace: str):
        self.workspace = Path(workspace)
        self.memory_dir = self.workspace / "memory"
        self.bank_dir = self.workspace / "bank"
        self.entities_dir = self.bank_dir / "entities"
        
        # Ensure directories exist
        self.memory_dir.mkdir(parents=True, exist_ok=True)
        self.bank_dir.mkdir(parents=True, exist_ok=True)
        self.entities_dir.mkdir(parents=True, exist_ok=True)
    
    def estimate_tokens(self, text: str) -> int:
        """Rough token estimation (4 chars ≈ 1 token)."""
        return len(text) // 4
    
    def parse_daily_log(self, file_path: Path) -> Dict:
        """Parse a daily log file into structured components."""
        content = file_path.read_text(encoding='utf-8')
        
        # Extract date from filename
        date_match = re.match(r'(\d{4}-\d{2}-\d{2})', file_path.name)
        date = date_match.group(1) if date_match else file_path.stem
        
        # Check if already has ## Retain section
        has_retain = '## Retain' in content
        
        # Find content to analyze (skip header and Retain section if present)
        lines = content.split('\n')
        content_lines = []
        skip_until_next_section = False
        
        for i, line in enumerate(lines):
            # Skip the title
            if i == 0 and line.startswith('# '):
                continue
            # Skip existing Retain section
            if line.startswith('## Retain'):
                skip_until_next_section = True
                continue
            if skip_until_next_section:
                if line.startswith('## '):
                    skip_until_next_section = False
                else:
                    continue
            content_lines.append(line)
        
        activity = '\n'.join(content_lines).strip()
        
        # Extract existing retain items
        retain_items = []
        if has_retain:
            retain_match = re.search(r'## Retain\n(.*?)(?=\n## |$)', content, re.DOTALL)
            if retain_match:
                retain_section = retain_match.group(1).strip()
                # Parse retain items (lines starting with -)
                for line in retain_section.split('\n'):
                    line = line.strip()
                    if line.startswith('- '):
                        retain_items.append(line[2:])
        
        return {
            'file': file_path,
            'date': date,
            'content': content,
            'has_retain': has_retain,
            'activity': activity,
            'retain_items': retain_items,
            'tokens': self.estimate_tokens(content)
        }
    
    def extract_facts(self, activity: str) -> List[Dict]:
        """Extract structured facts from activity text."""
        facts = []
        
        # Look for @mentions (entities)
        mentions = re.findall(r'@(\w+)', activity)
        
        # Pattern: learned something about entity
        learned_patterns = [
            r'(?:learned|discovered|found out) (?:that )?(\w+) (?:is|has|uses|prefers|likes|wants)',
            r'(\w+) (?:is|has|uses|prefers|likes|wants|needs)',
            r'(?:about|regarding) (\w+):',
        ]
        
        for pattern in learned_patterns:
            matches = re.finditer(pattern, activity, re.IGNORECASE)
            for match in matches:
                entity = match.group(1)
                # Get surrounding context
                start = max(0, match.start() - 50)
                end = min(len(activity), match.end() + 100)
                context = activity[start:end].strip()
                
                facts.append({
                    'type': 'learned',
                    'entity': entity,
                    'context': context,
                    'confidence': 0.75
                })
        
        # Look for preferences (indicated by keywords)
        pref_patterns = [
            r'(\w+) prefers? (.*?)(?:\.|\n|$)',
            r'(\w+) likes? (.*?)(?:\.|\n|$)',
            r'(\w+) wants? (.*?)(?:\.|\n|$)',
        ]
        
        for pattern in pref_patterns:
            matches = re.finditer(pattern, activity, re.IGNORECASE)
            for match in matches:
                entity = match.group(1)
                preference = match.group(2).strip()
                
                facts.append({
                    'type': 'opinion',
                    'entity': entity,
                    'statement': f"{entity} prefers/likes/wants: {preference}",
                    'confidence': 0.85,
                    'is_preference': True
                })
        
        # Look for decisions
        decision_patterns = [
            r'(?:decided|chose|will use|using) (.*?)',
            r'(?:setup|configured|installed) (.*?)',
            r'(?:planning to|going to) (.*?)',
        ]
        
        for pattern in decision_patterns:
            matches = re.finditer(pattern, activity, re.IGNORECASE)
            for match in matches:
                context_start = max(0, match.start() - 30)
                context_end = min(len(activity), match.end() + 80)
                decision = activity[context_start:context_end].strip()
                
                facts.append({
                    'type': 'world',
                    'entity': 'System' if 'server' in decision.lower() or 'config' in decision.lower() else None,
                    'statement': decision,
                    'confidence': 0.95
                })
        
        return facts
    
    def categorize_fact(self, fact: Dict) -> Tuple[str, str]:
        """Categorize fact into prefix code and formatted statement."""
        fact_type = fact.get('type', 'observation')
        entity = fact.get('entity')
        confidence = fact.get('confidence', 0.75)
        
        if fact_type == 'world' or (entity and entity.lower() in ['system', 'server', 'config', 'database']):
            prefix = 'W'
            if entity:
                statement = f"{prefix} @{entity}: {fact.get('statement', fact.get('context', ''))}"
            else:
                statement = f"{prefix}: {fact.get('statement', fact.get('context', ''))}"
        
        elif fact_type == 'opinion' or fact.get('is_preference'):
            prefix = 'O'
            if entity:
                statement = f"{prefix}(c={confidence:.2f}) @{entity}: {fact.get('statement', '')}"
            else:
                statement = f"{prefix}(c={confidence:.2f}): {fact.get('statement', '')}"
        
        elif fact_type == 'learned':
            prefix = 'B'  # Biographical
            if entity:
                statement = f"{prefix} @{entity}: {fact.get('context', '')}"
            else:
                statement = f"{prefix}: {fact.get('context', '')}"
        
        else:
            prefix = 'S'  # Summary
            statement = f"{prefix}: {fact.get('statement', fact.get('context', ''))}"
        
        return prefix, statement
    
    def generate_retain_section(self, facts: List[Dict]) -> str:
        """Generate ## Retain section from extracted facts."""
        if not facts:
            return ""
        
        lines = ["## Retain"]
        
        for fact in facts[:10]:  # Limit to top 10 facts
            _, statement = self.categorize_fact(fact)
            lines.append(f"- {statement}")
        
        return '\n'.join(lines)
    
    def update_entity_page(self, entity: str, facts: List[Dict], date: str):
        """Update or create entity page in bank/entities/."""
        entity_file = self.entities_dir / f"{entity}.md"
        
        # Read existing content or create new
        if entity_file.exists():
            content = entity_file.read_text(encoding='utf-8')
        else:
            content = f"# {entity}\n\n"
        
        # Extract Facts section or create it
        if '## Facts' not in content:
            content += "\n## Facts\n"
        
        # Add new facts
        facts_section = ""
        for fact in facts:
            if fact.get('entity') == entity and fact.get('type') in ['learned', 'world']:
                statement = fact.get('statement', fact.get('context', ''))
                facts_section += f"- {statement}\n"
        
        if facts_section:
            # Insert before ## Preferences if it exists
            if '## Preferences' in content:
                content = content.replace('## Preferences', facts_section + '## Preferences')
            else:
                content += facts_section
        
        # Add Preferences section for opinions
        opinions = [f for f in facts if f.get('entity') == entity and f.get('type') == 'opinion']
        if opinions:
            if '## Preferences' not in content:
                content += "\n## Preferences\n"
            
            for opinion in opinions:
                statement = opinion.get('statement', '')
                content += f"- {statement}\n"
        
        # Update Last Updated
        if '## Last Updated' in content:
            content = re.sub(r'## Last Updated\n.*', f'## Last Updated\n{date}', content)
        else:
            content += f"\n## Last Updated\n{date}\n"
        
        entity_file.write_text(content, encoding='utf-8')
        print(f"  Updated entity: {entity}")
    
    def update_opinions_file(self, opinions: List[Dict], date: str, source_file: str):
        """Update bank/opinions.md with tracked opinions."""
        opinions_file = self.bank_dir / "opinions.md"
        
        if opinions_file.exists():
            content = opinions_file.read_text(encoding='utf-8')
        else:
            content = "# Tracked Opinions\n\n## Format\n- Statement: ...\n- Confidence: ...\n- Evidence: ...\n- Last Updated: ...\n\n"
        
        # Group opinions by entity
        by_entity = {}
        for opinion in opinions:
            entity = opinion.get('entity', 'Unknown')
            if entity not in by_entity:
                by_entity[entity] = []
            by_entity[entity].append(opinion)
        
        # Add new opinions
        for entity, entity_opinions in by_entity.items():
            # Check if entity section exists
            if f"## {entity}" not in content:
                content += f"\n## {entity}\n\n"
            
            for opinion in entity_opinions:
                statement = opinion.get('statement', '')
                confidence = opinion.get('confidence', 0.75)
                
                # Check if this opinion already exists
                if statement not in content:
                    opinion_block = f"### {statement[:50]}...\n"
                    opinion_block += f"- Statement: {statement}\n"
                    opinion_block += f"- Confidence: {confidence:.2f}\n"
                    opinion_block += f"- Evidence: {source_file}\n"
                    opinion_block += f"- Last Updated: {date}\n\n"
                    
                    # Insert after ## {entity}
                    entity_section = f"## {entity}"
                    parts = content.split(entity_section)
                    if len(parts) == 2:
                        content = parts[0] + entity_section + "\n" + opinion_block + parts[1]
        
        opinions_file.write_text(content, encoding='utf-8')
    
    def process_daily_log(self, log_file: Path) -> bool:
        """Process a single daily log file."""
        print(f"Processing: {log_file.name}")
        
        parsed = self.parse_daily_log(log_file)
        
        # Skip if already has Retain section
        if parsed['has_retain']:
            print(f"  Already has ## Retain section, skipping")
            return False
        
        # Skip if no activity
        if not parsed['activity']:
            print(f"  No activity log found, skipping")
            return False
        
        # Extract facts
        facts = self.extract_facts(parsed['activity'])
        
        if not facts:
            print(f"  No facts extracted, skipping")
            return False
        
        # Generate retain section
        retain_section = self.generate_retain_section(facts)
        
        if not retain_section:
            print(f"  No retain section generated, skipping")
            return False
        
        # Insert into file
        content = parsed['content']
        
        # Find best place to insert (before next ## or at end)
        lines = content.split('\n')
        insert_idx = len(lines)
        
        for i, line in enumerate(lines):
            if i > 0 and line.startswith('## ') and not line.startswith('## Activity'):
                insert_idx = i
                break
        
        lines.insert(insert_idx, '')
        lines.insert(insert_idx + 1, retain_section)
        
        new_content = '\n'.join(lines)
        log_file.write_text(new_content, encoding='utf-8')
        
        print(f"  Added ## Retain section with {len(facts)} facts")
        
        # Update entity pages
        entities: List[str] = [cast(str, f.get('entity')) for f in facts if f.get('entity') and f.get('entity') != 'Unknown']
        for entity in entities:
            entity_facts = [f for f in facts if f.get('entity') == entity]
            self.update_entity_page(entity, entity_facts, parsed['date'])
        
        # Update opinions file
        opinions = [f for f in facts if f.get('type') == 'opinion']
        if opinions:
            self.update_opinions_file(opinions, parsed['date'], f"memory/{log_file.name}")
        
        return True
    
    def run_reflection(self):
        """Main reflection process."""
        print("="*60)
        print("Memory Reflection - Distilling Daily Logs")
        print("="*60)
        print()
        
        # Find all daily logs
        log_files = sorted(self.memory_dir.glob("2*.md"))  # 2024, 2025, 2026...
        
        if not log_files:
            print("No daily logs found.")
            return
        
        print(f"Found {len(log_files)} daily log(s)")
        print()
        
        processed = 0
        skipped = 0
        
        for log_file in log_files:
            try:
                if self.process_daily_log(log_file):
                    processed += 1
                else:
                    skipped += 1
            except Exception as e:
                print(f"  ERROR processing {log_file.name}: {e}")
                skipped += 1
        
        print()
        print("="*60)
        print(f"Summary: {processed} processed, {skipped} skipped")
        print("="*60)


def main():
    parser = argparse.ArgumentParser(
        description='Reflect and distill OpenClaw memory files'
    )
    parser.add_argument(
        '--workspace',
        default=os.path.expanduser('~/.openclaw/workspace'),
        help='Path to OpenClaw workspace'
    )
    
    args = parser.parse_args()
    
    if not os.path.exists(args.workspace):
        print(f"Error: Workspace not found: {args.workspace}")
        sys.exit(1)
    
    reflector = MemoryReflector(args.workspace)
    reflector.run_reflection()


if __name__ == '__main__':
    main()
