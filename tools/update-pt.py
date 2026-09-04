import json, urllib.request, ssl

url = "https://raw.githubusercontent.com/Bowserinator/Periodic-Table-JSON/master/PeriodicTableJSON.json"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as response:
    data = json.loads(response.read().decode("utf-8"))

mapped = []
for el in data["elements"]:
    cat = el.get("category", "")
    if "alkali metal" in cat: cat = "alkali-metal"
    elif "alkaline earth metal" in cat: cat = "alkaline-earth"
    elif "transition metal" in cat: cat = "transition-metal"
    elif "post-transition metal" in cat: cat = "post-transition"
    elif "metalloid" in cat: cat = "metalloid"
    elif "noble gas" in cat: cat = "noble-gas"
    elif "lanthanide" in cat: cat = "lanthanide"
    elif "actinide" in cat: cat = "actinide"
    elif el.get("group") == 17: cat = "halogen"
    else: cat = "non-metal"
    
    col = el.get("xpos")
    row = el.get("ypos")
    
    desc = el.get("summary", "")
    if len(desc) > 80: desc = desc[:77] + "..."
    desc = desc.replace("'", "\\'")
    
    mass = el.get("atomic_mass")
    if isinstance(mass, (int, float)):
        mass = f"{mass:.3f}"
    elif isinstance(mass, list):
        mass = f"{mass[0]:.3f}"
    else:
        mass = str(mass)
        
    line = f"            {{ z: {el.get('number')}, symbol: '{el.get('symbol')}', name: '{el.get('name')}', mass: '{mass}', col: {col}, row: {row}, cat: '{cat}', desc: '{desc}' }}"
    mapped.append(line)

array_str = "const elementsData = [\n" + ",\n".join(mapped) + "\n        ];"

colors_str = """
            const catColors = {
                'non-metal': '#bae6fd',
                'alkali-metal': '#fecaca',
                'alkaline-earth': '#fde68a',
                'transition-metal': '#e9d5ff',
                'post-transition': '#bbf7d0',
                'metalloid': '#fde047',
                'halogen': '#fed7aa',
                'noble-gas': '#c7d2fe',
                'lanthanide': '#fbcfe8',
                'actinide': '#f472b6'
            };"""

with open("c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/resources.html", "r", encoding="utf-8") as f:
    html = f.read()

start_idx = html.find("const elementsData = [")
end_idx = html.find("];", start_idx) + 2

if start_idx != -1 and end_idx != -1:
    html = html[:start_idx] + array_str + html[end_idx:]
    
    c_start = html.find("const catColors = {")
    c_end = html.find("};", c_start) + 2
    if c_start != -1:
        html = html[:c_start] + colors_str.strip() + html[c_end:]
        
    with open("c:/Users/HP/OneDrive/Desktop/ChemLearn AI/frontend/resources.html", "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Success. Mapped {len(mapped)} elements.")
else:
    print("Could not find targets.")
