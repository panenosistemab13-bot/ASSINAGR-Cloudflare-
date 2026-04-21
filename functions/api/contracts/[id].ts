export async function onRequestGet(context) {
  const { params, env } = context;
  try {
    const id = params.id;
    const contractStr = await env.ASSINATURAS.get(id);
    
    if (!contractStr) {
      return new Response(JSON.stringify({ error: "Contract not found" }), { status: 404 });
    }
    
    return new Response(contractStr, {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestDelete(context) {
  const { params, env } = context;
  try {
    const id = params.id;
    await env.ASSINATURAS.delete(id);
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
