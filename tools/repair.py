with open('lessons.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

target_idx = -1
for i, line in enumerate(lines):
    if '} finally {' in line and i > 1410 and i < 1425:
        target_idx = i
        break

if target_idx != -1:
    new_lines = lines[:target_idx+1]
    new_lines.extend([
        '                btn.innerText = "✨ Generate AI Flashcards";\n',
        '                btn.disabled = false;\n',
        '            }\n',
        '        };\n',
        '    </script>\n',
        '</body>\n',
        '</html>\n'
    ])
    with open('lessons.html', 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print('lessons.html repaired')
else:
    print('Could not find target index')
