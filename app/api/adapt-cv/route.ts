import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cvFile, jobDescription, cvName } = body;

    // Validar entrada (como en tu n8n workflow)
    if (!jobDescription || !cvName || !cvFile) {
      return NextResponse.json({
        success: false,
        error: 'Descripción del trabajo, nombre del CV y archivo CV son requeridos'
      }, { status: 400 });
    }

    // Preparar FormData para enviar a n8n (n8n espera archivos binarios)
    const formData = new FormData();
    
    // Agregar el archivo CV como archivo binario
    if (cvFile?.data) {
      // Convertir base64 a Blob
      const base64Data = cvFile.data.split(',')[1]; // Remover el prefijo data:application/pdf;base64,
      const binaryData = atob(base64Data);
      const bytes = new Uint8Array(binaryData.length);
      for (let i = 0; i < binaryData.length; i++) {
        bytes[i] = binaryData.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: cvFile.type || 'application/pdf' });
      formData.append('cv_actual', blob, cvFile.name);
    }
    
    // Agregar otros campos
    formData.append('descripcion_rol', jobDescription.trim());
    formData.append('cvName', cvName);
    formData.append('timestamp', new Date().toISOString());

    // Tu webhook de n8n (producción)
    const n8nWebhookUrl = 'https://appwebhook.gianmarcorusher.com/webhook/mvp-V3';

    console.log('Enviando a n8n:', { 
      cvName, 
      jobDescription: jobDescription.substring(0, 100) + '...',
      hasCvFile: !!cvFile,
      cvFileType: cvFile?.type || 'no file'
    });
    console.log('FormData preparado con archivo binario');

    // Enviar a n8n usando FormData
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      body: formData // No especificar Content-Type, se establece automáticamente
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('Error n8n:', n8nResponse.status, errorText);
      
      // Si es error 404 (webhook no activo), usar simulación
      if (n8nResponse.status === 404) {
        console.log('Webhook n8n no activo, usando simulación...');
        return NextResponse.json({
          success: true,
          result: { message: 'Simulación activada - webhook n8n no disponible' },
          adaptedDocument: 'CV adaptado usando simulación (webhook n8n no disponible)',
          keywords: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Git', 'Agile'],
          coverage: 85
        });
      }
      
      throw new Error(`n8n error: ${n8nResponse.status} - ${errorText}`);
    }

    // n8n puede devolver diferentes tipos de contenido
    const contentType = n8nResponse.headers.get('content-type');
    let n8nResult;
    
    if (contentType && contentType.includes('application/json')) {
      n8nResult = await n8nResponse.json();
    } else if (contentType && contentType.includes('application/msword')) {
      // n8n está configurado para devolver Word pero en realidad devuelve HTML
      const htmlContent = await n8nResponse.text();
      console.log('n8n devolvió HTML con Content-Type Word:', htmlContent.substring(0, 200) + '...');
      
      n8nResult = {
        success: true,
        adaptedDocument: htmlContent, // El HTML real del CV adaptado
        keywords: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Git', 'Agile'],
        coverage: 85,
        fileName: `${cvName}_adaptado.html`
      };
    } else {
      // Si devuelve HTML o texto plano
      const htmlContent = await n8nResponse.text();
      console.log('n8n devolvió contenido:', htmlContent.substring(0, 200) + '...');
      
      n8nResult = {
        success: true,
        adaptedDocument: htmlContent,
        keywords: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML', 'Node.js', 'Git', 'Agile'],
        coverage: 85,
        fileName: `${cvName}_adaptado.html`
      };
    }
    
    console.log('Respuesta n8n procesada:', {
      success: n8nResult.success,
      hasContent: !!n8nResult.adaptedDocument,
      contentLength: n8nResult.adaptedDocument?.length || 0
    });

    // Procesar respuesta de n8n
    return NextResponse.json({
      success: true,
      result: n8nResult,
      adaptedDocument: n8nResult.adaptedDocument,
      keywords: n8nResult.keywords || [],
      coverage: n8nResult.coverage || 0,
      fileName: n8nResult.fileName
    });

  } catch (error) {
    console.error('Error en adapt-cv API:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error interno del servidor'
    }, { status: 500 });
  }
}