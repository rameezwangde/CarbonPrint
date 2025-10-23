#!/usr/bin/env python3
"""
AWS Lambda Deployment Script
"""
import os
import subprocess
import zipfile
import shutil

def create_deployment_package():
    """Create deployment package for AWS Lambda"""
    
    # Create deployment directory
    deploy_dir = "lambda_deploy"
    if os.path.exists(deploy_dir):
        shutil.rmtree(deploy_dir)
    os.makedirs(deploy_dir)
    
    # Copy source files
    files_to_copy = [
        "main.py",
        "lambda_handler.py",
        "models/",
        "services/",
        "data/",
        "requirements.txt"
    ]
    
    for item in files_to_copy:
        if os.path.exists(item):
            if os.path.isdir(item):
                shutil.copytree(item, os.path.join(deploy_dir, item))
            else:
                shutil.copy2(item, deploy_dir)
    
    # Install dependencies
    print("Installing dependencies...")
    subprocess.run([
        "pip", "install", "-r", "requirements.txt", 
        "-t", deploy_dir, "--no-deps"
    ], check=True)
    
    # Create zip file
    zip_file = "carbon-print-backend.zip"
    if os.path.exists(zip_file):
        os.remove(zip_file)
    
    with zipfile.ZipFile(zip_file, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(deploy_dir):
            for file in files:
                file_path = os.path.join(root, file)
                arc_path = os.path.relpath(file_path, deploy_dir)
                zipf.write(file_path, arc_path)
    
    print(f"Deployment package created: {zip_file}")
    return zip_file

if __name__ == "__main__":
    create_deployment_package()
