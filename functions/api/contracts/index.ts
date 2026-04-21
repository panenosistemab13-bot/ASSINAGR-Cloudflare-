export async function onRequestGet(context) {
  const { env } = context;
  try {
    const value = await env.ASSINATURAS.list();
    
    // Cloudflare KV list() returns { keys: [{ name: "id" }] }
    const keys = value.keys;
    const contracts = [];
    
    for (const keyObj of keys) {
      const dataStr = await env.ASSINATURAS.get(keyObj.name);
      if (dataStr) {
        contracts.push(JSON.parse(dataStr));
      }
    }
    
    // Order by created_at desc
    contracts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    
    return new Response(JSON.stringify(contracts), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { id, data } = await request.json();
    
    const contract = {
      id,
      dados: data,
      signature: null,
      signed_at: null,
      created_at: new Date().toISOString(),
      onbase_status: false
    };
    
    await env.ASSINATURAS.put(id, JSON.stringify(contract));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
