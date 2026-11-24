# -*- coding: utf-8 -*-
"""
UdanPath Diagrams Viewer Generator Wrapper
Runs scripts/build_system_design_module.py to regenerate system diagrams and HTML viewer.
"""
import sys
import subprocess
import os

if __name__ == "__main__":
    script_path = os.path.join(os.path.dirname(__file__), "build_system_design_module.py")
    res = subprocess.run([sys.executable, script_path], check=True)
    sys.exit(res.returncode)
