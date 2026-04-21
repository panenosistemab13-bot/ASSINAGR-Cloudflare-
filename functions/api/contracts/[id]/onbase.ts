export async function onRequestPost(context) {
  const { request, params, env } = context;
  try {
    const id = params.id;
    const { status } = await request.json();
    
    const contractStr = await env.ASSINATURAS.get(id);
    if (contractStr) {
      const contract = JSON.parse(contractStr);
      contract.onbase_status = status;
      await env.ASSINATURAS.put(id, JSON.stringify(contract));
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
