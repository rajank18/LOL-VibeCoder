#!/usr/bin/env python3
"""
Python Analyzer for LOLVibeCoder Backend
Performs advanced static code analysis to detect AI-generated code patterns
"""

import os
import sys
import json
import ast
import re
import glob
from pathlib import Path
from typing import Dict, List, Tuple, Any

class PythonCodeAnalyzer:
    def __init__(self, repo_path: str):
        self.repo_path = repo_path
        self.metrics = {
            "comments_score": 0,
            "naming_score": 0,
            "tests_score": 0,
            "examples_score": 0,
            "highlights": []
        }
        
        # AI pattern detection
        self.ai_patterns = {
            "generic_names": 0,
            "perfect_formatting": 0,
            "boilerplate_code": 0,
            "repetitive_patterns": 0,
            "ai_comments": 0
        }
    
    def analyze_repository(self) -> Dict[str, Any]:
        """Main analysis function"""
        try:
            print(f"Analyzing repository: {self.repo_path}", file=sys.stderr)
            
            # Find all code files
            code_files = self._find_code_files()
            print(f"Found {len(code_files)} code files", file=sys.stderr)
            
            if not code_files:
                self.metrics["highlights"].append("No code files found")
                return self.metrics
            
            # Analyze each file
            total_files = 0
            total_lines = 0
            total_comments = 0
            total_functions = 0
            total_classes = 0
            
            for file_path in code_files:
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                    
                    lines = content.split('\n')
                    total_files += 1
                    total_lines += len(lines)
                    
                    # Count comments
                    comments = self._count_comments(content, file_path)
                    total_comments += comments
                    
                    # Analyze code structure
                    functions, classes = self._analyze_code_structure(content, file_path)
                    total_functions += functions
                    total_classes += classes
                    
                    # Detect AI patterns
                    self._detect_ai_patterns(content, file_path)
                    
                except Exception as e:
                    print(f"Warning: Could not analyze {file_path}: {e}", file=sys.stderr)
                    continue
            
            # Calculate scores
            self._calculate_scores(total_files, total_lines, total_comments, total_functions, total_classes)
            
            # Generate highlights
            self._generate_highlights()
            
            print(f"Analysis complete: {self.metrics}", file=sys.stderr)
            return self.metrics
            
        except Exception as e:
            print(f"Error analyzing repository: {e}", file=sys.stderr)
            return {"error": str(e)}
    
    def _find_code_files(self) -> List[str]:
        """Find all code files in the repository"""
        code_extensions = [
            '*.py', '*.js', '*.jsx', '*.ts', '*.tsx', '*.java', '*.cpp', '*.c', '*.h',
            '*.cs', '*.php', '*.rb', '*.go', '*.rs', '*.swift', '*.kt', '*.scala',
            '*.vue', '*.svelte', '*.dart', '*.elm', '*.ex', '*.exs', '*.erl'
        ]
        
        code_files = []
        for ext in code_extensions:
            pattern = os.path.join(self.repo_path, '**', ext)
            code_files.extend(glob.glob(pattern, recursive=True))
        
        # Filter out common non-code directories
        filtered_files = []
        for file_path in code_files:
            if not any(skip in file_path for skip in ['node_modules', '.git', 'dist', 'build', '__pycache__']):
                filtered_files.append(file_path)
        
        return filtered_files
    
    def _count_comments(self, content: str, file_path: str) -> int:
        """Count comment lines in the file"""
        lines = content.split('\n')
        comment_count = 0
        
        for line in lines:
            stripped = line.strip()
            if not stripped:
                continue
                
            # Different comment patterns for different file types
            ext = Path(file_path).suffix.lower()
            
            if ext in ['.py']:
                if stripped.startswith('#'):
                    comment_count += 1
            elif ext in ['.js', '.jsx', '.ts', '.tsx', '.java', '.cpp', '.c', '.h', '.cs']:
                if stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
                    comment_count += 1
            elif ext in ['.html', '.xml']:
                if stripped.startswith('<!--'):
                    comment_count += 1
            elif ext in ['.css', '.scss', '.sass']:
                if stripped.startswith('/*') or stripped.startswith('*'):
                    comment_count += 1
            elif ext in ['.sh', '.bat', '.ps1']:
                if stripped.startswith('#'):
                    comment_count += 1
        
        return comment_count
    
    def _analyze_code_structure(self, content: str, file_path: str) -> Tuple[int, int]:
        """Analyze code structure for functions and classes"""
        functions = 0
        classes = 0
        
        try:
            ext = Path(file_path).suffix.lower()
            
            if ext == '.py':
                # Use AST for Python files
                try:
                    tree = ast.parse(content)
                    functions = len([node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)])
                    classes = len([node for node in ast.walk(tree) if isinstance(node, ast.ClassDef)])
                except:
                    # Fallback to regex
                    functions = len(re.findall(r'def\s+\w+\s*\(', content))
                    classes = len(re.findall(r'class\s+\w+', content))
            
            else:
                # Use regex for other languages
                if ext in ['.js', '.jsx', '.ts', '.tsx']:
                    functions = len(re.findall(r'function\s+\w+\s*\(|const\s+\w+\s*=\s*\([^)]*\)\s*=>', content))
                    classes = len(re.findall(r'class\s+\w+', content))
                elif ext in ['.java', '.cpp', '.c', '.h', '.cs']:
                    functions = len(re.findall(r'\w+\s+\w+\s*\([^)]*\)\s*\{', content))
                    classes = len(re.findall(r'class\s+\w+', content))
                elif ext in ['.php']:
                    functions = len(re.findall(r'function\s+\w+\s*\(', content))
                    classes = len(re.findall(r'class\s+\w+', content))
                elif ext in ['.rb']:
                    functions = len(re.findall(r'def\s+\w+', content))
                    classes = len(re.findall(r'class\s+\w+', content))
                elif ext in ['.go']:
                    functions = len(re.findall(r'func\s+\w+', content))
                    classes = len(re.findall(r'type\s+\w+\s+struct', content))
        
        except Exception as e:
            print(f"Warning: Could not analyze structure of {file_path}: {e}")
        
        return functions, classes
    
    def _detect_ai_patterns(self, content: str, file_path: str):
        """Detect AI-generated code patterns"""
        lines = content.split('\n')
        
        # 1. Generic variable names (AI often uses generic names)
        generic_patterns = [
            r'\b(data|result|value|item|temp|tempVar|tempValue|tempData)\b',
            r'\b(user|users|item|items|data|datas|list|lists)\b',
            r'\b(handle|process|execute|perform|do|run)\w*\b',
            r'\b(helper|util|utility|common|shared)\w*\b'
        ]
        
        generic_count = 0
        for pattern in generic_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            generic_count += len(matches)
        
        if generic_count > 10:
            self.ai_patterns["generic_names"] += 1
        
        # 2. Perfect formatting (AI generates very clean code)
        indentation_consistency = self._check_indentation_consistency(lines)
        if indentation_consistency > 0.95:
            self.ai_patterns["perfect_formatting"] += 1
        
        # 3. Boilerplate code patterns
        boilerplate_patterns = [
            r'function\s+\w+\s*\(\s*\)\s*\{[\s\S]*?\}',
            r'class\s+\w+\s*\{[\s\S]*?\}',
            r'const\s+\w+\s*=\s*\([^)]*\)\s*=>\s*\{[\s\S]*?\}',
            r'def\s+\w+\s*\([^)]*\):\s*pass'
        ]
        
        boilerplate_count = 0
        for pattern in boilerplate_patterns:
            matches = re.findall(pattern, content, re.MULTILINE)
            boilerplate_count += len(matches)
        
        if boilerplate_count > 3:
            self.ai_patterns["boilerplate_code"] += 1
        
        # 4. Repetitive patterns
        repetitive_ratio = self._detect_repetitive_patterns(content)
        if repetitive_ratio > 0.3:
            self.ai_patterns["repetitive_patterns"] += 1
        
        # 5. AI-generated comments
        ai_comment_patterns = [
            r'# This function',
            r'# TODO:',
            r'# FIXME:',
            r'# Note:',
            r'# This is a',
            r'# The following',
            r'/\* This function',
            r'/\* TODO:',
            r'// This function',
            r'// TODO:'
        ]
        
        ai_comment_count = 0
        for pattern in ai_comment_patterns:
            matches = re.findall(pattern, content, re.IGNORECASE)
            ai_comment_count += len(matches)
        
        if ai_comment_count > 5:
            self.ai_patterns["ai_comments"] += 1
    
    def _check_indentation_consistency(self, lines: List[str]) -> float:
        """Check indentation consistency"""
        indentations = []
        for line in lines:
            if line.strip():
                indent = len(line) - len(line.lstrip())
                indentations.append(indent)
        
        if not indentations:
            return 1.0
        
        # Check if indentation follows a consistent pattern
        spaces = sum(1 for indent in indentations if indent % 4 == 0)
        tabs = sum(1 for indent in indentations if indent % 1 == 0 and indent > 0)
        
        return max(spaces, tabs) / len(indentations)
    
    def _detect_repetitive_patterns(self, content: str) -> float:
        """Detect repetitive patterns in code"""
        lines = [line.strip() for line in content.split('\n') if line.strip()]
        
        if len(lines) < 5:
            return 0.0
        
        # Look for repeated line patterns
        line_counts = {}
        for line in lines:
            normalized = re.sub(r'\s+', ' ', line)
            line_counts[normalized] = line_counts.get(normalized, 0) + 1
        
        repeated_lines = sum(1 for count in line_counts.values() if count > 1)
        return repeated_lines / len(lines)
    
    def _calculate_scores(self, total_files: int, total_lines: int, total_comments: int, 
                         total_functions: int, total_classes: int):
        """Calculate final scores based on analysis"""
        
        # Comments score (0-10)
        if total_lines > 0:
            comment_ratio = total_comments / total_lines
            if comment_ratio > 0.3:
                self.metrics["comments_score"] = 10
            elif comment_ratio > 0.2:
                self.metrics["comments_score"] = 8
            elif comment_ratio > 0.1:
                self.metrics["comments_score"] = 6
            elif comment_ratio > 0.05:
                self.metrics["comments_score"] = 4
            else:
                self.metrics["comments_score"] = 2
        else:
            self.metrics["comments_score"] = 0
        
        # Naming score (0-10) - based on AI patterns
        naming_score = 10
        if self.ai_patterns["generic_names"] > total_files * 0.3:
            naming_score -= 4
        elif self.ai_patterns["generic_names"] > total_files * 0.1:
            naming_score -= 2
        
        self.metrics["naming_score"] = max(0, naming_score)
        
        # Tests score (0-10)
        test_files = self._count_test_files()
        if test_files > 0:
            self.metrics["tests_score"] = 10
        else:
            self.metrics["tests_score"] = 0
        
        # Examples score (0-10)
        examples_score = 0
        if self._has_readme():
            examples_score += 5
        if self._has_examples():
            examples_score += 3
        if total_functions > 0:
            examples_score += 2
        
        self.metrics["examples_score"] = min(10, examples_score)
    
    def _count_test_files(self) -> int:
        """Count test files in the repository"""
        test_patterns = [
            '**/test_*.py', '**/*_test.py', '**/tests/**/*.py',
            '**/test_*.js', '**/*.test.js', '**/*.spec.js',
            '**/test_*.ts', '**/*.test.ts', '**/*.spec.ts',
            '**/test_*.java', '**/*Test.java', '**/*Tests.java',
            '**/test_*.cpp', '**/*_test.cpp', '**/tests/**/*.cpp'
        ]
        
        test_files = 0
        for pattern in test_patterns:
            pattern_path = os.path.join(self.repo_path, pattern)
            test_files += len(glob.glob(pattern_path, recursive=True))
        
        return test_files
    
    def _has_readme(self) -> bool:
        """Check if README exists"""
        readme_patterns = ['README*', 'readme*', 'Readme*']
        for pattern in readme_patterns:
            pattern_path = os.path.join(self.repo_path, pattern)
            if glob.glob(pattern_path):
                return True
        return False
    
    def _has_examples(self) -> bool:
        """Check if examples exist"""
        example_patterns = ['**/example*', '**/examples/**', '**/demo*', '**/demos/**']
        for pattern in example_patterns:
            pattern_path = os.path.join(self.repo_path, pattern)
            if glob.glob(pattern_path, recursive=True):
                return True
        return False
    
    def _generate_highlights(self):
        """Generate highlights based on analysis"""
        highlights = []
        
        # AI pattern highlights
        if self.ai_patterns["generic_names"] > 0:
            highlights.append(f"Generic naming patterns detected ({self.ai_patterns['generic_names']} files)")
        
        if self.ai_patterns["perfect_formatting"] > 0:
            highlights.append(f"Perfect formatting detected ({self.ai_patterns['perfect_formatting']} files)")
        
        if self.ai_patterns["boilerplate_code"] > 0:
            highlights.append(f"Boilerplate code patterns ({self.ai_patterns['boilerplate_code']} files)")
        
        if self.ai_patterns["repetitive_patterns"] > 0:
            highlights.append(f"Repetitive code patterns ({self.ai_patterns['repetitive_patterns']} files)")
        
        if self.ai_patterns["ai_comments"] > 0:
            highlights.append(f"AI-generated comment patterns ({self.ai_patterns['ai_comments']} files)")
        
        # Positive highlights
        if self._has_readme():
            highlights.append("README present")
        
        if self.metrics["tests_score"] > 0:
            highlights.append("Test files found")
        
        if self.metrics["examples_score"] > 5:
            highlights.append("Good documentation/examples")
        
        if not highlights:
            highlights.append("Basic code structure")
        
        self.metrics["highlights"] = highlights

def main():
    """Main function to run the analyzer"""
    if len(sys.argv) != 2:
        print("Usage: python pythonAnalyzer.py <repo_path>", file=sys.stderr)
        sys.exit(1)
    
    repo_path = sys.argv[1]
    
    if not os.path.exists(repo_path):
        print(f"Error: Repository path does not exist: {repo_path}", file=sys.stderr)
        sys.exit(1)
    
    analyzer = PythonCodeAnalyzer(repo_path)
    result = analyzer.analyze_repository()
    
    # Output only JSON result to stdout (debug info goes to stderr)
    print(json.dumps(result))

if __name__ == "__main__":
    main()
