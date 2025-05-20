import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { app } from 'electron';

// Puerto para el servidor proxy
const PROXY_PORT = 3000;

// URL base de la API de Palo Alto
const TARGET_API = 'https://api-pcscortexcloud.xdr.us.paloaltonetworks.com';

export function startProxyServer() {
  const proxyServer = express();
  
  // Habilitar CORS para todas las rutas
  proxyServer.use(cors());
  
  // Configurar middleware de proxy
  proxyServer.use('/proxy-api', createProxyMiddleware({
    target: TARGET_API,
    changeOrigin: true,
    pathRewrite: {
      '^/proxy-api': '', // Quitar el prefijo '/proxy-api' de las rutas
    },
    // Usamos las opciones compatibles con los tipos
    onProxyRes: function(proxyRes) {
      // Agregar encabezados CORS a la respuesta
      proxyRes.headers['Access-Control-Allow-Origin'] = '*';
      proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, x-xdr-auth-id';
    }
  }));
  
  // Iniciar servidor proxy
  const server = proxyServer.listen(PROXY_PORT, () => {
    console.log(`Proxy server running at http://localhost:${PROXY_PORT}`);
  });
  
  // Asegurarse de que el servidor se cierre cuando se cierre la aplicación
  app.on('will-quit', () => {
    server.close();
  });
  
  return PROXY_PORT;
} 