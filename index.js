  addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    // 从请求头获取目标主机
    const targetHost = request.headers.get('P-PROXY-HOST')
    
    if (!targetHost) {
      return new Response('Missing P-PROXY-HOST header', { status: 400 })
    }
  
    try {
      // 构建目标 URL
      const url = new URL(request.url)
      const targetURL = `${targetHost}${url.pathname}${url.search}`
  
      // 创建新的请求头，移除可能导致问题的头
      const newHeaders = new Headers(request.headers)
      newHeaders.delete('P-PROXY-HOST')
      newHeaders.delete('host')
      newHeaders.delete('cf-connecting-ip')
      newHeaders.delete('cf-ipcountry')
      newHeaders.delete('cf-ray')
      newHeaders.delete('cf-visitor')
      newHeaders.delete('x-real-ip')
  
      // 构建新的请求
      const modifiedRequest = new Request(targetURL, {
        method: request.method,
        headers: newHeaders,
        body: request.body,
      })
  
      // 发送请求到目标服务器
      const response = await fetch(modifiedRequest)
      
      // 构建新的响应
      const modifiedResponse = new Response(response.body, response)
      
      // 添加 CORS 头
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
      modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH')
      modifiedResponse.headers.set('Access-Control-Allow-Headers', '*')
      
      return modifiedResponse
  
    } catch (error) {
      return new Response(`Proxy Error: ${error.message}`, { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'text/plain'
        }
      })
    }
  }