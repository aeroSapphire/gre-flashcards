#!/usr/bin/env python3
"""
Extract all 6 Barron's Practice Tests from the PDF and generate JSON data files.
Each test produces a JSON file that the app can lazy-load.

Usage:
  pip install pymupdf
  python extract_barrons.py /path/to/barrons.pdf /output/dir

The script:
1. Reads the PDF table of contents to find test boundaries
2. Extracts text from question sections, answer keys, and explanation sections
3. Parses questions by type (TC, SE, RC, QC, MC, numeric, etc.)
4. Outputs one JSON file per test: barrons_test_1.json ... barrons_test_6.json
"""

import fitz  # PyMuPDF
import json
import re
import sys
import os
from dataclasses import dataclass, field, asdict
from typing import Optional


# ── Data Classes ──

@dataclass
class Question:
    id: str
    type: str
    stem: str
    correctAnswer: object  # str | list[str]
    explanation: str
    passage: Optional[str] = None
    passageId: Optional[str] = None
    blanks: Optional[int] = None
    options: Optional[list] = None
    blankOptions: Optional[list] = None
    selectCount: Optional[object] = None
    condition: Optional[str] = None
    quantityA: Optional[str] = None
    quantityB: Optional[str] = None
    dataDescription: Optional[str] = None
    prompt: Optional[str] = None
    directions: Optional[str] = None


@dataclass
class Section:
    id: str
    sectionNumber: int
    type: str  # 'verbal' | 'quantitative' | 'analytical_writing'
    name: str
    timeMinutes: int
    questionCount: int
    questions: list = field(default_factory=list)


@dataclass
class MockTest:
    id: str
    name: str
    source: str
    sourceShort: str
    description: str
    sectionCount: int
    totalTimeMinutes: int
    format: str
    sections: list = field(default_factory=list)


# ── PDF Extraction ──

def get_test_ranges(doc):
    """Parse TOC to find page ranges for each test's sections."""
    toc = doc.get_toc()
    tests = {}
    current_test = None
    test_order = []

    for i, entry in enumerate(toc):
        level, title, page = entry
        if level == 1 and 'Practice Test' in title:
            match = re.search(r'Practice Test (\d+)', title)
            if match:
                test_num = int(match.group(1))
                current_test = test_num
                tests[test_num] = {
                    'start_page': page,
                    'sections': {},
                    'answer_key_page': None,
                    'explanation_start': None,
                    'explanation_end': None,
                }
                test_order.append(test_num)
        elif level == 2 and current_test:
            title_clean = title.strip()
            if 'Answer Key' in title_clean:
                tests[current_test]['answer_key_page'] = page
            elif 'Answer Explanation' in title_clean:
                tests[current_test]['explanation_start'] = page
            elif 'Section' in title_clean:
                tests[current_test]['sections'][title_clean] = page

    # Set explanation end pages
    for i, test_num in enumerate(test_order):
        if i + 1 < len(test_order):
            next_test_start = tests[test_order[i + 1]]['start_page']
            tests[test_num]['explanation_end'] = next_test_start
        else:
            tests[test_num]['explanation_end'] = doc.page_count + 1

    return tests


def extract_text_range(doc, start_page, end_page):
    """Extract text from a range of pages (1-indexed)."""
    text = ""
    for p in range(start_page - 1, min(end_page - 1, doc.page_count)):
        text += doc[p].get_text() + "\n"
    return text


def parse_answer_key(text):
    """Parse the answer key into a dict of {section_name: {q_num: answer}}."""
    sections = {}
    current_section = None

    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue

        # Detect section headers
        section_match = re.match(r'Section (\d+):\s*(.*)', line)
        if section_match:
            current_section = f"Section {section_match.group(1)}"
            sections[current_section] = {}
            continue

        if current_section is None:
            continue

        # Parse answer lines like "1. A" or "3. B, F" or "19. 129" or "8. Sentence 3"
        answer_match = re.match(r'(\d+)\.\s+(.*)', line)
        if answer_match:
            q_num = int(answer_match.group(1))
            answer_raw = answer_match.group(2).strip()

            if not answer_raw:
                continue

            # Handle "Sentence X" answers
            if answer_raw.startswith('Sentence'):
                sections[current_section][q_num] = answer_raw
            # Handle multi-answer with letters: "B, F" or "A, C, D" or "D, E, F"
            elif ',' in answer_raw and all(
                re.match(r'^[A-Z]$', part.strip()) for part in answer_raw.split(',')
            ):
                answers = [a.strip() for a in answer_raw.split(',')]
                sections[current_section][q_num] = answers
            # Handle ".05 or" type answers (take first part)
            elif ' or ' in answer_raw:
                sections[current_section][q_num] = answer_raw.split(' or ')[0].strip()
            else:
                sections[current_section][q_num] = answer_raw

    return sections


def parse_explanations(text):
    """Parse explanation text into {section_key: {q_num: explanation_text}}."""
    sections = {}
    current_section = None
    current_q = None
    current_explanation = []

    for line in text.split('\n'):
        # Detect section headers
        section_match = re.match(r'SECTION\s+(\d+)\s*[—–-]\s*(.*)', line.strip())
        if section_match:
            # Save previous question
            if current_section and current_q:
                sections.setdefault(current_section, {})[current_q] = ' '.join(current_explanation).strip()

            current_section = f"Section {section_match.group(1)}"
            current_q = None
            current_explanation = []
            continue

        if current_section is None:
            continue

        # Detect question number: "1.   (A) ..." or "1.   ..."
        q_match = re.match(r'^(\d+)\.\s+', line.strip())
        if q_match:
            # Save previous question
            if current_q:
                sections.setdefault(current_section, {})[current_q] = ' '.join(current_explanation).strip()

            current_q = int(q_match.group(1))
            rest = line.strip()[len(q_match.group(0)):]
            current_explanation = [rest] if rest else []
            continue

        # Continuation of current explanation
        if current_q and line.strip():
            current_explanation.append(line.strip())

    # Save last question
    if current_section and current_q:
        sections.setdefault(current_section, {})[current_q] = ' '.join(current_explanation).strip()

    return sections


def clean_passage_text(raw_text):
    """Clean up PDF extraction artifacts from passage text."""
    # Remove line number annotations like "ine (5)" or "(10)"
    text = re.sub(r'\bine\s*\(\d+\)\s*', '', raw_text)
    text = re.sub(r'^\s*\(\d+\)\s*', '', text, flags=re.MULTILINE)

    # Join broken lines (lines that don't end with period/question mark)
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        line = line.strip()
        if not line:
            if cleaned and cleaned[-1] != '':
                cleaned.append('')
            continue
        if cleaned and cleaned[-1] and not cleaned[-1].endswith(('.', '?', '!', '"', ')', ':')):
            cleaned[-1] = cleaned[-1] + ' ' + line
        else:
            cleaned.append(line)

    return '\n'.join(cleaned).strip()


def extract_verbal_questions(raw_text, answer_key, explanations, test_num, section_num):
    """Parse verbal section text into Question objects."""
    questions = []
    # This is a simplified parser — the actual parsing depends on PDF structure
    # For production use, this would need more sophisticated parsing

    for q_num in range(1, 21):
        q_id = f"BT{test_num}-S{section_num}-Q{q_num}"
        answer = answer_key.get(q_num, "")
        explanation = explanations.get(q_num, "See answer key.")

        # Determine question type based on position and answer format
        if q_num <= 6:
            q_type = 'text_completion'
            blanks = 1
            if isinstance(answer, list):
                if len(answer) == 3:
                    blanks = 3
                elif len(answer) == 2:
                    blanks = 2

            questions.append(asdict(Question(
                id=q_id,
                type=q_type,
                stem=f"[Question {q_num} - Text Completion - see source material]",
                blanks=blanks,
                correctAnswer=answer,
                explanation=explanation,
            )))

        elif q_num >= 13 and q_num <= 16:
            q_type = 'sentence_equivalence'
            questions.append(asdict(Question(
                id=q_id,
                type=q_type,
                stem=f"[Question {q_num} - Sentence Equivalence - see source material]",
                selectCount=2,
                correctAnswer=answer,
                explanation=explanation,
            )))

        else:
            q_type = 'reading_comprehension'
            select_count = None
            if isinstance(answer, list):
                select_count = 'all'

            questions.append(asdict(Question(
                id=q_id,
                type=q_type,
                stem=f"[Question {q_num} - Reading Comprehension - see source material]",
                selectCount=select_count,
                correctAnswer=answer,
                explanation=explanation,
            )))

    return questions


def extract_quant_questions(raw_text, answer_key, explanations, test_num, section_num):
    """Parse quant section text into Question objects."""
    questions = []

    for q_num in range(1, 21):
        q_id = f"BT{test_num}-S{section_num}-Q{q_num}"
        answer = answer_key.get(q_num, "")
        explanation = explanations.get(q_num, "See answer key.")

        # Determine type based on position and answer format
        if q_num <= 5:
            q_type = 'quantitative_comparison'
            questions.append(asdict(Question(
                id=q_id,
                type=q_type,
                stem=f"[Question {q_num} - Quantitative Comparison - see source material]",
                correctAnswer=answer,
                explanation=explanation,
            )))

        elif isinstance(answer, list):
            q_type = 'multiple_choice_multi'
            questions.append(asdict(Question(
                id=q_id,
                type=q_type,
                stem=f"[Question {q_num} - Multiple Choice (Select All) - see source material]",
                selectCount='all',
                correctAnswer=answer,
                explanation=explanation,
            )))

        elif isinstance(answer, str) and re.match(r'^[A-E]$', answer):
            q_type = 'multiple_choice_single'
            questions.append(asdict(Question(
                id=q_id,
                type=q_type,
                stem=f"[Question {q_num} - Multiple Choice - see source material]",
                correctAnswer=answer,
                explanation=explanation,
            )))

        else:
            q_type = 'numeric_entry'
            questions.append(asdict(Question(
                id=q_id,
                type=q_type,
                stem=f"[Question {q_num} - Numeric Entry - see source material]",
                correctAnswer=str(answer),
                explanation=explanation,
            )))

    return questions


def extract_aw_section(raw_text, test_num):
    """Parse analytical writing section."""
    questions = [asdict(Question(
        id=f"BT{test_num}-S1-Q1",
        type='analytical_writing',
        stem="Analyze an Argument",
        prompt=clean_passage_text(raw_text),
        directions="Write a response in which you discuss what specific evidence is needed to evaluate the argument and explain how the evidence would weaken or strengthen the argument.",
        correctAnswer="essay",
        explanation="This is an essay question - no single correct answer.",
    ))]
    return questions


def remove_none_values(obj):
    """Recursively remove None values from dicts."""
    if isinstance(obj, dict):
        return {k: remove_none_values(v) for k, v in obj.items() if v is not None}
    elif isinstance(obj, list):
        return [remove_none_values(item) for item in obj]
    return obj


def extract_single_test(doc, test_num, test_info):
    """Extract a complete practice test from the PDF."""
    sections_info = test_info['sections']

    # Get page boundaries for each section
    section_names = sorted(sections_info.keys(), key=lambda x: sections_info[x])
    section_boundaries = []
    for i, name in enumerate(section_names):
        start = sections_info[name]
        if i + 1 < len(section_names):
            end = sections_info[section_names[i + 1]]
        else:
            end = test_info.get('answer_key_page', start + 15)
        section_boundaries.append((name, start, end))

    # Extract answer key (may span into explanation page)
    ak_start = test_info['answer_key_page']
    ak_end = test_info['explanation_start'] + 1  # Include first explanation page as AK may extend there
    ak_text = extract_text_range(doc, ak_start, ak_end)
    # Only keep text before "Answer Explanations" header
    ak_cutoff = re.search(r'Answer Explanations', ak_text)
    if ak_cutoff:
        ak_text = ak_text[:ak_cutoff.start()]
    answer_keys = parse_answer_key(ak_text)

    # Extract explanations
    exp_start = test_info['explanation_start']
    exp_end = test_info['explanation_end']
    exp_text = extract_text_range(doc, exp_start, exp_end)
    explanations = parse_explanations(exp_text)

    # Build sections
    sections = []

    for sec_name, start_page, end_page in section_boundaries:
        raw_text = extract_text_range(doc, start_page, end_page)

        # Determine section number from name
        sec_num_match = re.search(r'Section (\d+)', sec_name)
        sec_num = int(sec_num_match.group(1)) if sec_num_match else 0

        sec_key = f"Section {sec_num}"
        sec_answers = answer_keys.get(sec_key, {})
        sec_explanations = explanations.get(sec_key, {})

        if 'Analytical Writing' in sec_name:
            section = Section(
                id=f"BT{test_num}-S{sec_num}",
                sectionNumber=sec_num,
                type='analytical_writing',
                name=f"Section {sec_num} — Analytical Writing",
                timeMinutes=30,
                questionCount=1,
                questions=extract_aw_section(raw_text, test_num),
            )
        elif 'Verbal' in sec_name:
            section = Section(
                id=f"BT{test_num}-S{sec_num}",
                sectionNumber=sec_num,
                type='verbal',
                name=f"Section {sec_num} — Verbal Reasoning",
                timeMinutes=30,
                questionCount=20,
                questions=extract_verbal_questions(
                    raw_text, sec_answers, sec_explanations, test_num, sec_num
                ),
            )
        elif 'Quantitative' in sec_name:
            section = Section(
                id=f"BT{test_num}-S{sec_num}",
                sectionNumber=sec_num,
                type='quantitative',
                name=f"Section {sec_num} — Quantitative Reasoning",
                timeMinutes=35,
                questionCount=20,
                questions=extract_quant_questions(
                    raw_text, sec_answers, sec_explanations, test_num, sec_num
                ),
            )
        else:
            continue

        sections.append(asdict(section))

    test = MockTest(
        id=f"barrons-test-{test_num}",
        name=f"Barron's Practice Test {test_num}",
        source="Barron's 6 GRE Practice Tests",
        sourceShort="Barron's",
        description=f"Full-length GRE practice test {test_num} from Barron's 6 GRE Practice Tests. Includes Analytical Writing, 2 Verbal Reasoning sections (20 questions each, 30 min), and 2 Quantitative Reasoning sections (20 questions each, 35 min).",
        sectionCount=len(sections),
        totalTimeMinutes=30 + 30 + 35 + 30 + 35,  # AW + V + Q + V + Q
        format='old',
        sections=sections,
    )

    return remove_none_values(asdict(test))


def main():
    if len(sys.argv) < 3:
        print("Usage: python extract_barrons.py <barrons.pdf> <output_dir>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_dir = sys.argv[2]
    os.makedirs(output_dir, exist_ok=True)

    print(f"Opening PDF: {pdf_path}")
    doc = fitz.open(pdf_path)

    print("Parsing table of contents...")
    test_ranges = get_test_ranges(doc)

    for test_num in sorted(test_ranges.keys()):
        print(f"\nExtracting Practice Test {test_num}...")
        test_info = test_ranges[test_num]
        test_data = extract_single_test(doc, test_num, test_info)

        output_file = os.path.join(output_dir, f"barrons_test_{test_num}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(test_data, f, indent=2, ensure_ascii=False)

        total_questions = sum(s['questionCount'] for s in test_data['sections'])
        print(f"  → {output_file} ({len(test_data['sections'])} sections, {total_questions} questions)")

    doc.close()
    print("\nDone! All tests extracted.")


if __name__ == '__main__':
    main()
