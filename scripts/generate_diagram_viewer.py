import os
import re
import json

def parse_markdown(filepath):
    if not os.path.exists(filepath):
        print(f"Error: {filepath} does not exist.")
        return []

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Split by headings starting with "## " (except the TABLE OF CONTENTS header)
    sections = re.split(r'\n##\s+', content)
    diagrams = []

    for section in sections:
        if not section.strip():
            continue
        
        # Skip TABLE OF CONTENTS or introductory headings
        if "TABLE OF CONTENTS" in section or "UDANPATH" in section.split('\n')[0]:
            continue

        lines = section.strip().split('\n')
        title = lines[0].strip()

        # Reconstruct the section text
        section_text = '\n'.join(lines[1:])

        # Find Purpose
        purpose_match = re.search(r'###\s+Purpose\s*\n(.*?)(?=\n###|\n```mermaid)', section_text, re.DOTALL)
        purpose = purpose_match.group(1).strip() if purpose_match else ""

        # Find Actors & Components
        actors_match = re.search(r'###\s+Actors\s*&\s*Components\s*\n(.*?)(?=\n###|\n```mermaid)', section_text, re.DOTALL)
        if not actors_match:
            actors_match = re.search(r'###\s+Components\s*\n(.*?)(?=\n###|\n```mermaid)', section_text, re.DOTALL)
        actors = actors_match.group(1).strip() if actors_match else ""

        # Find Flow & Relationships
        flow_match = re.search(r'###\s+Flow\s*&\s*Relationships\s*\n(.*?)(?=\n###|\n```mermaid)', section_text, re.DOTALL)
        if not flow_match:
            flow_match = re.search(r'###\s+Important\s*Relationships\s*\n(.*?)(?=\n###|\n```mermaid)', section_text, re.DOTALL)
        flow = flow_match.group(1).strip() if flow_match else ""

        # Find Mermaid code
        mermaid_match = re.search(r'```mermaid\s*\n(.*?)\n```', section_text, re.DOTALL)
        mermaid_code = mermaid_match.group(1).strip() if mermaid_match else ""

        if title and mermaid_code:
            diagrams.append({
                "title": title,
                "purpose": purpose,
                "actors": actors,
                "flow": flow,
                "mermaid": mermaid_code
            })

    return diagrams

def generate_html(diagrams, output_path):
    # Convert diagrams list to JSON string for injection
    diagrams_json = json.dumps(diagrams, indent=2)

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UdanPath System Diagrams Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.6.1/dist/svg-pan-zoom.min.js"></script>
    <style>
        :root {{
            --bg-primary: #0a0e17;
            --bg-secondary: #121824;
            --bg-glass: rgba(18, 24, 36, 0.7);
            --border-glass: rgba(255, 255, 255, 0.08);
            --text-primary: #f3f4f6;
            --text-secondary: #9ca3af;
            --accent-primary: #3b82f6;
            --accent-secondary: #60a5fa;
            --accent-glow: rgba(59, 130, 246, 0.15);
            --sidebar-width: 320px;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            font-family: 'Outfit', sans-serif;
            background-color: var(--bg-primary);
            color: var(--text-primary);
            display: flex;
            height: 100vh;
            overflow: hidden;
            background-image: 
                radial-gradient(circle at 10% 20%, rgba(59, 130, 246, 0.08) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(147, 51, 234, 0.06) 0%, transparent 40%);
        }}

        /* Sidebar Styling */
        .sidebar {{
            width: var(--sidebar-width);
            background-color: var(--bg-secondary);
            border-right: 1px solid var(--border-glass);
            display: flex;
            flex-direction: column;
            height: 100%;
            flex-shrink: 0;
            z-index: 10;
        }}

        .sidebar-header {{
            padding: 24px;
            border-bottom: 1px solid var(--border-glass);
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
        }}

        .sidebar-header h1 {{
            font-size: 1.5rem;
            font-weight: 700;
            background: linear-gradient(to right, #60a5fa, #c084fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 4px;
        }}

        .sidebar-header p {{
            font-size: 0.75rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1.5px;
        }}

        .diagram-list {{
            list-style: none;
            overflow-y: auto;
            flex-grow: 1;
            padding: 12px;
        }}

        .diagram-list::-webkit-scrollbar {{
            width: 6px;
        }}

        .diagram-list::-webkit-scrollbar-thumb {{
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
        }}

        .diagram-item {{
            padding: 12px 16px;
            margin-bottom: 6px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            font-weight: 400;
            color: var(--text-secondary);
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            border: 1px solid transparent;
            display: flex;
            align-items: center;
        }}

        .diagram-item:hover {{
            background-color: rgba(255, 255, 255, 0.03);
            color: var(--text-primary);
        }}

        .diagram-item.active {{
            background-color: var(--accent-glow);
            color: var(--accent-secondary);
            border-color: rgba(59, 130, 246, 0.3);
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.05);
        }}

        .diagram-num {{
            font-size: 0.75rem;
            opacity: 0.7;
            margin-right: 8px;
            background-color: rgba(255, 255, 255, 0.08);
            padding: 2px 6px;
            border-radius: 4px;
            min-width: 24px;
            text-align: center;
        }}

        /* Main Content Styling */
        .main-content {{
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
            position: relative;
        }}

        .main-header {{
            padding: 24px 40px;
            border-bottom: 1px solid var(--border-glass);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: var(--bg-glass);
            backdrop-filter: blur(12px);
        }}

        .main-header h2 {{
            font-size: 1.6rem;
            font-weight: 600;
            color: var(--text-primary);
        }}

        .tabs {{
            display: flex;
            background-color: rgba(255, 255, 255, 0.05);
            padding: 4px;
            border-radius: 8px;
            border: 1px solid var(--border-glass);
        }}

        .tab-btn {{
            padding: 8px 16px;
            border: none;
            background: none;
            color: var(--text-secondary);
            font-family: inherit;
            font-size: 0.85rem;
            font-weight: 500;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.2s ease;
        }}

        .tab-btn.active {{
            background-color: var(--bg-primary);
            color: var(--text-primary);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }}

        /* Viewport Panels */
        .viewport {{
            flex-grow: 1;
            padding: 40px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }}

        .meta-card {{
            background-color: var(--bg-glass);
            border: 1px solid var(--border-glass);
            border-radius: 12px;
            padding: 24px;
            backdrop-filter: blur(12px);
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }}

        .meta-section h3 {{
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--accent-secondary);
            margin-bottom: 8px;
            text-transform: uppercase;
            letter-spacing: 1px;
            display: flex;
            align-items: center;
            gap: 6px;
        }}

        .meta-section p {{
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.5;
        }}

        .meta-section ul {{
            padding-left: 20px;
            color: var(--text-secondary);
            font-size: 0.9rem;
            line-height: 1.5;
        }}

        /* Diagram Visualizer Panel */
        .visualizer-container {{
            flex-grow: 1;
            background-color: #0f131a;
            border: 1px solid var(--border-glass);
            border-radius: 12px;
            padding: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 500px;
            position: relative;
            overflow: hidden;
            box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.4);
        }}

        /* Source Code Panel */
        .source-container {{
            display: none;
            flex-grow: 1;
            background-color: #0b0d13;
            border: 1px solid var(--border-glass);
            border-radius: 12px;
            padding: 24px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 0.9rem;
            color: #34d399;
            overflow: auto;
            white-space: pre-wrap;
            position: relative;
            box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.6);
        }}

        .copy-btn {{
            position: absolute;
            top: 16px;
            right: 16px;
            background-color: rgba(255, 255, 255, 0.08);
            border: 1px solid var(--border-glass);
            color: var(--text-primary);
            padding: 6px 12px;
            border-radius: 6px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .copy-btn:hover {{
            background-color: var(--accent-primary);
            border-color: var(--accent-primary);
        }}

        /* Loading Indicator */
        .loader {{
            border: 4px solid rgba(255, 255, 255, 0.05);
            border-top: 4px solid var(--accent-primary);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
            display: none;
            position: absolute;
        }}

        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}

        /* Custom spacing modifications */
        .markdown-lists ul {{
            list-style-type: disc;
            margin-left: 16px;
            margin-top: 6px;
        }}
        .markdown-lists li {{
            margin-bottom: 4px;
        }}
    </style>
</head>
<body>

    <!-- Sidebar Section -->
    <div class="sidebar">
        <div class="sidebar-header">
            <h1>UdanPath</h1>
            <p>System Diagrams Portal</p>
        </div>
        <ul class="diagram-list" id="diagram-list">
            <!-- Populated via Javascript -->
        </ul>
    </div>

    <!-- Main Content Section -->
    <div class="main-content">
        <div class="main-header">
            <h2 id="current-title">1. System Context Diagram</h2>
            <div class="tabs">
                <button class="tab-btn active" id="tab-visual">Visual Diagram</button>
                <button class="tab-btn" id="tab-source">Mermaid Source</button>
            </div>
        </div>

        <div class="viewport">
            <!-- Metadata Card -->
            <div class="meta-card">
                <div class="meta-section">
                    <h3>Purpose</h3>
                    <p id="desc-purpose">Loading...</p>
                </div>
                <div class="meta-section" id="meta-actors-section">
                    <h3>Actors / Components</h3>
                    <div id="desc-actors" class="markdown-lists">Loading...</div>
                </div>
                <div class="meta-section" id="meta-flow-section">
                    <h3>Flow & Relationships</h3>
                    <div id="desc-flow" class="markdown-lists">Loading...</div>
                </div>
            </div>

            <!-- Visualizer Viewport -->
            <div class="visualizer-container" id="visualizer">
                <div class="loader" id="diagram-loader"></div>
                <div id="diagram-render" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;"></div>
            </div>

            <!-- Source Code Viewport -->
            <div class="source-container" id="source-code">
                <button class="copy-btn" id="copy-btn">Copy Code</button>
                <code id="code-content"></code>
            </div>
        </div>
    </div>

    <!-- Load Mermaid.js ESM -->
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        
        // Initialize Mermaid for Dark Mode
        mermaid.initialize({{
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            flowchart: {{
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis'
            }},
            sequence: {{
                useMaxWidth: true,
                showSequenceNumbers: true,
                actorMargin: 50,
                width: 150,
                height: 45
            }},
            class: {{
                useMaxWidth: true
            }},
            er: {{
                useMaxWidth: true,
                fontSize: 12
            }}
        }});

        window.mermaid = mermaid;
        
        // Inject compiled diagrams database
        const DIAGRAMS_DB = {diagrams_json};

        // Render functions and layout controls
        let activeIdx = 0;
        let activeTab = 'visual'; // 'visual' or 'source'

        const listContainer = document.getElementById('diagram-list');
        const currentTitle = document.getElementById('current-title');
        const descPurpose = document.getElementById('desc-purpose');
        const descActors = document.getElementById('desc-actors');
        const descFlow = document.getElementById('desc-flow');
        const diagramRender = document.getElementById('diagram-render');
        const codeContent = document.getElementById('code-content');
        const diagramLoader = document.getElementById('diagram-loader');
        const copyBtn = document.getElementById('copy-btn');

        const tabVisual = document.getElementById('tab-visual');
        const tabSource = document.getElementById('tab-source');
        const visualizer = document.getElementById('visualizer');
        const sourceContainer = document.getElementById('source-code');

        // Populate Sidebar
        function populateSidebar() {{
            listContainer.innerHTML = '';
            DIAGRAMS_DB.forEach((diag, index) => {{
                const li = document.createElement('li');
                li.className = `diagram-item ${{index === activeIdx ? 'active' : ''}}`;
                
                // Format the title to separate the number and the name
                const matches = diag.title.match(/^(\\d+)\\.\\s*(.*)/);
                const num = matches ? matches[1] : (index + 1);
                const name = matches ? matches[2] : diag.title;

                li.innerHTML = `<span class="diagram-num">${{num}}</span><span class="diagram-name">${{name}}</span>`;
                li.addEventListener('click', () => switchDiagram(index));
                listContainer.appendChild(li);
            }});
        }}

        // Helper to format bullets in metadata
        function formatMarkdownText(text) {{
            if (!text) return '<p>N/A</p>';
            
            // Check if it's already html-like
            if (text.startsWith('<')) return text;

            // Simple markdown conversion for bullet lists
            let lines = text.split('\\n');
            let html = '';
            let inList = false;

            for (let line of lines) {{
                line = line.trim();
                if (line.startsWith('*') || line.startsWith('-')) {{
                    if (!inList) {{
                        html += '<ul>';
                        inList = true;
                    }}
                    // Extract bullet text and bold content
                    let bulletText = line.substring(1).trim();
                    bulletText = bulletText.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                    html += `<li>${{bulletText}}</li>`;
                }} else {{
                    if (inList) {{
                        html += '</ul>';
                        inList = false;
                    }}
                    if (line) {{
                        let paragraphText = line.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
                        html += `<p>${{paragraphText}}</p>`;
                    }}
                }}
            }}
            if (inList) html += '</ul>';
            return html;
        }}

        // Switch active tab
        function switchTab(tab) {{
            activeTab = tab;
            if (tab === 'visual') {{
                tabVisual.classList.add('active');
                tabSource.classList.remove('active');
                visualizer.style.display = 'flex';
                sourceContainer.style.display = 'none';
            }} else {{
                tabVisual.classList.remove('active');
                tabSource.classList.add('active');
                visualizer.style.display = 'none';
                sourceContainer.style.display = 'block';
            }}
        }}

        // Switch diagram
        async function switchDiagram(idx) {{
            activeIdx = idx;
            const items = listContainer.querySelectorAll('.diagram-item');
            items.forEach((item, index) => {{
                if (index === idx) item.classList.add('active');
                else item.classList.remove('active');
            }});

            const diag = DIAGRAMS_DB[idx];
            currentTitle.textContent = diag.title;
            descPurpose.textContent = diag.purpose || 'N/A';
            
            // Render Actors and Flow
            descActors.innerHTML = formatMarkdownText(diag.actors);
            descFlow.innerHTML = formatMarkdownText(diag.flow);
            
            // Hide/Show actor or flow sections if they are empty
            document.getElementById('meta-actors-section').style.display = diag.actors ? 'block' : 'none';
            document.getElementById('meta-flow-section').style.display = diag.flow ? 'block' : 'none';

            // Load raw source code
            codeContent.textContent = diag.mermaid;

            // Render visual diagram using Mermaid
            diagramRender.innerHTML = '';
            diagramLoader.style.display = 'block';

            try {{
                const cleanCode = diag.mermaid.trim();
                const uniqueId = `mermaid-render-${{idx}}-${{Date.now()}}`;
                
                // Clear any leftover artifacts
                diagramRender.innerHTML = '<div class="loader"></div>';

                // Call Mermaid render API
                const {{ svg }} = await window.mermaid.render(uniqueId, cleanCode);
                
                diagramLoader.style.display = 'none';
                diagramRender.innerHTML = svg;

                // Adjust SVG dimensions and initialize svg-pan-zoom
                const svgElement = diagramRender.querySelector('svg');
                if (svgElement) {{
                    svgElement.setAttribute('width', '100%');
                    svgElement.setAttribute('height', '100%');
                    svgElement.style.maxWidth = 'none';
                    svgElement.style.maxHeight = 'none';
                    svgElement.style.width = '100%';
                    svgElement.style.height = '100%';
                    
                    if (window.panZoomInstance) {{
                        window.panZoomInstance.destroy();
                    }}
                    
                    window.panZoomInstance = svgPanZoom(svgElement, {{
                        zoomEnabled: true,
                        controlIconsEnabled: true,
                        fit: true,
                        center: true,
                        minZoom: 0.05,
                        maxZoom: 15
                    }});
                }}
            }} catch (error) {{
                console.error("Mermaid Render Error: ", error);
                diagramLoader.style.display = 'none';
                diagramRender.innerHTML = `
                    <div style="color: #ef4444; text-align: center; padding: 20px; border: 1px dashed rgba(239, 68, 68, 0.4); border-radius: 8px; background-color: rgba(239, 68, 68, 0.05);">
                        <p style="font-weight: 600; margin-bottom: 8px;">Mermaid Render Error</p>
                        <p style="font-size: 0.85rem; font-family: monospace; opacity: 0.8;">${{error.message || error}}</p>
                    </div>
                `;
            }}
        }}

        // Copy button handling
        copyBtn.addEventListener('click', () => {{
            navigator.clipboard.writeText(codeContent.textContent);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => {{
                copyBtn.textContent = 'Copy Code';
            }}, 2000);
        }});

        tabVisual.addEventListener('click', () => switchTab('visual'));
        tabSource.addEventListener('click', () => switchTab('source'));

        // On Start
        populateSidebar();
        switchDiagram(0);
    </script>
</body>
</html>
"""

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_template)
    print(f"Success: Interactive Diagrams Viewer written to {output_path}")

if __name__ == "__main__":
    workspace_root = "d:\\MINOR-PROJECT_84"
    md_path = os.path.join(workspace_root, "docs", "system_diagrams.md")
    html_path = os.path.join(workspace_root, "docs", "view_diagrams.html")
    
    print("Parsing system_diagrams.md...")
    diagrams = parse_markdown(md_path)
    print(f"Parsed {len(diagrams)} diagrams successfully.")
    
    print("Generating HTML viewer...")
    generate_html(diagrams, html_path)
