export default {
  async fetch(request, env) {
    // Enable CORS for all requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS requests (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders,
        status: 204
      });
    }

    try {
      const url = new URL(request.url);
      const path = url.pathname;

      // GET /api/contracts - Listar histórico
      if (request.method === 'GET' && path === '/api/contracts') {
        const val = await env.ASSINATURAS.list();
        const keys = val.keys || [];
        const contracts = [];

        for (let k of keys) {
          const raw = await env.ASSINATURAS.get(k.name);
          if (raw) contracts.push(JSON.parse(raw));
        }

        // Sort by created_at descending
        contracts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        return new Response(JSON.stringify(contracts), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      // POST /api/contracts - Criar novo contrato
      if (request.method === 'POST' && path === '/api/contracts') {
        const body = await request.json();
        
        // Assegura estrutura do objeto
        const newContract = {
          id: body.id,
          data: body.data || body.dados, // Suporta as duas chaves dependendo do send
          signature: null,
          signed_at: null,
          created_at: body.created_at || new Date().toISOString(),
          onbase_status: body.onbase_status || false
        };

        if (!newContract.id) {
          newContract.id = crypto.randomUUID();
        }

        await env.ASSINATURAS.put(newContract.id, JSON.stringify(newContract));
        
        return new Response(JSON.stringify({ success: true, contract: newContract }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }

      // GET /api/contracts/:id - Pegar contrato específico
      if (request.method === 'GET' && path.match(/^\/api\/contracts\/[^\/]+$/)) {
        const id = path.split('/').pop();
        const raw = await env.ASSINATURAS.get(id);
        
        if (!raw) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          });
        }

        return new Response(raw, {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      // POST /api/contracts/:id/sign - Assinar contrato
      if (request.method === 'POST' && path.match(/^\/api\/contracts\/[^\/]+\/sign$/)) {
        const id = path.split('/')[3];
        const body = await request.json();
        
        if (!body.signature) {
          return new Response(JSON.stringify({ error: 'Signature is required' }), {
             headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             status: 400
          });
        }

        const raw = await env.ASSINATURAS.get(id);
        if (!raw) {
          return new Response(JSON.stringify({ error: 'Contract not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          });
        }

        const contract = JSON.parse(raw);
        contract.signature = body.signature;
        contract.signed_at = new Date().toISOString(); 
        // O frontend lê contract.signature (que é a base64 da imagem) para saber se está assinado.

        await env.ASSINATURAS.put(id, JSON.stringify(contract));

        return new Response(JSON.stringify({ success: true, contract }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      // POST /api/contracts/:id/onbase
      if (request.method === 'POST' && path.match(/^\/api\/contracts\/[^\/]+\/onbase$/)) {
        const id = path.split('/')[3];
        const body = await request.json();

        const raw = await env.ASSINATURAS.get(id);
        if (!raw) {
          return new Response(JSON.stringify({ error: 'Contract not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          });
        }

        const contract = JSON.parse(raw);
        contract.onbase_status = body.status;

        await env.ASSINATURAS.put(id, JSON.stringify(contract));

        return new Response(JSON.stringify({ success: true, contract }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      // DELETE /api/contracts/:id
      if (request.method === 'DELETE' && path.match(/^\/api\/contracts\/[^\/]+$/)) {
        const id = path.split('/').pop();
        await env.ASSINATURAS.delete(id);

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }

      // Rota não encontrada
      return new Response(JSON.stringify({ error: 'Not found route' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      });

    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ error: err.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      });
    }
  }
};
