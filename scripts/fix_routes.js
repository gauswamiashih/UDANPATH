const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  content = content.replace(/'\/ai'/g, "'/student/ai'");
  content = content.replace(/'\/courses'/g, "'/student/courses'");
  content = content.replace(/'\/exams\//g, "'/student/exams/");
  content = content.replace(/'\/guide'/g, "'/student/guide'");
  content = content.replace(/'\/notifications'/g, "'/student/notifications'");
  content = content.replace(/'\/profile'/g, "'/student/profile'");
  content = content.replace(/'\/roadmaps'/g, "'/student/roadmaps'");
  content = content.replace(/'\/saved'/g, "'/student/saved'");
  content = content.replace(/'\/settings'/g, "'/student/settings'");
  content = content.replace(/'\/simulator'/g, "'/student/simulator'");

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    console.log('Updated ' + filePath);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir('./app');
