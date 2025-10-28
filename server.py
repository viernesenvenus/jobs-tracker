#!/usr/bin/env python3
"""
Servidor local de Python para Talenia
Sirve archivos estáticos y redirige a Next.js en desarrollo
"""

import http.server
import socketserver
import subprocess
import threading
import time
import webbrowser
import os
import sys
from pathlib import Path

class TaleniaHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Añadir headers CORS para desarrollo
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def check_node_installed():
    """Verificar si Node.js está instalado"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js encontrado: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js no está instalado o no está en el PATH")
    print("Por favor instala Node.js desde: https://nodejs.org/")
    return False

def check_npm_installed():
    """Verificar si npm está instalado"""
    try:
        result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm encontrado: {result.stdout.strip()}")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ npm no está instalado o no está en el PATH")
    return False

def install_dependencies():
    """Instalar dependencias de Node.js"""
    print("📦 Instalando dependencias de Node.js...")
    try:
        result = subprocess.run(['npm', 'install'], check=True, capture_output=True, text=True)
        print("✅ Dependencias instaladas correctamente")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error instalando dependencias: {e}")
        print(f"Output: {e.stdout}")
        print(f"Error: {e.stderr}")
        return False

def start_nextjs_dev():
    """Iniciar servidor de desarrollo de Next.js"""
    print("🚀 Iniciando servidor de desarrollo de Next.js...")
    try:
        # Cambiar al directorio del proyecto
        os.chdir(Path(__file__).parent)
        
        # Iniciar Next.js en modo desarrollo
        process = subprocess.Popen(
            ['npm', 'run', 'dev'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        
        # Esperar a que el servidor esté listo
        print("⏳ Esperando a que Next.js esté listo...")
        time.sleep(5)
        
        # Verificar si el proceso sigue corriendo
        if process.poll() is None:
            print("✅ Servidor Next.js iniciado correctamente")
            return process
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Error iniciando Next.js:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"❌ Error iniciando Next.js: {e}")
        return None

def start_python_server(port=8000):
    """Iniciar servidor HTTP de Python"""
    print(f"🐍 Iniciando servidor Python en puerto {port}...")
    
    try:
        with socketserver.TCPServer(("", port), TaleniaHandler) as httpd:
            print(f"✅ Servidor Python ejecutándose en http://localhost:{port}")
            print("📁 Sirviendo archivos estáticos...")
            httpd.serve_forever()
    except OSError as e:
        if e.errno == 48:  # Address already in use
            print(f"❌ Puerto {port} ya está en uso. Probando puerto {port + 1}...")
            start_python_server(port + 1)
        else:
            print(f"❌ Error iniciando servidor Python: {e}")

def main():
    """Función principal"""
    print("🎯 Talenia - Servidor Local")
    print("=" * 40)
    
    # Verificar prerrequisitos
    if not check_node_installed():
        sys.exit(1)
    
    if not check_npm_installed():
        sys.exit(1)
    
    # Verificar si package.json existe
    if not Path("package.json").exists():
        print("❌ No se encontró package.json en el directorio actual")
        print("Asegúrate de estar en el directorio del proyecto Talenia")
        sys.exit(1)
    
    # Instalar dependencias si es necesario
    if not Path("node_modules").exists():
        if not install_dependencies():
            sys.exit(1)
    else:
        print("✅ Dependencias ya instaladas")
    
    # Iniciar Next.js en un hilo separado
    nextjs_process = start_nextjs_dev()
    if nextjs_process is None:
        print("❌ No se pudo iniciar Next.js")
        sys.exit(1)
    
    # Esperar un poco más para asegurar que Next.js esté listo
    time.sleep(3)
    
    # Abrir navegador
    print("🌐 Abriendo navegador...")
    webbrowser.open("http://localhost:3000")
    
    print("\n" + "=" * 40)
    print("🎉 Talenia está ejecutándose!")
    print("📱 Aplicación: http://localhost:3000")
    print("🌐 Producción: https://talenia.vercel.app")
    print("📁 Archivos estáticos: http://localhost:8000")
    print("\n💡 Comandos útiles:")
    print("   - Ctrl+C para detener ambos servidores")
    print("   - La aplicación se recargará automáticamente al hacer cambios")
    print("=" * 40)
    
    try:
        # Mantener el script corriendo
        while True:
            time.sleep(1)
            
            # Verificar si Next.js sigue corriendo
            if nextjs_process.poll() is not None:
                print("❌ Next.js se detuvo inesperadamente")
                break
                
    except KeyboardInterrupt:
        print("\n🛑 Deteniendo servidores...")
        
        # Detener Next.js
        if nextjs_process and nextjs_process.poll() is None:
            nextjs_process.terminate()
            try:
                nextjs_process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                nextjs_process.kill()
        
        print("✅ Servidores detenidos correctamente")

if __name__ == "__main__":
    main()

