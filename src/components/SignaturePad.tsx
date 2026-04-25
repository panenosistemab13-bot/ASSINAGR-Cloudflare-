import React, { useRef, useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
  saving?: boolean;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onClear, saving }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0000FF'; // Azul vivo
    ctx.shadowBlur = 1;
    ctx.shadowColor = '#0000FF';

    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        // Aumentar a altura para facilitar a assinatura do nome completo, especialmente no mobile
        const isMobile = window.innerWidth < 640;
        canvas.height = isMobile ? 350 : 250;
        // Redraw settings after resize
        const newCtx = canvas.getContext('2d');
        if (newCtx) {
          newCtx.lineWidth = 3;
          newCtx.lineCap = 'round';
          newCtx.lineJoin = 'round';
          newCtx.strokeStyle = '#0000FF'; // Azul vivo
          newCtx.shadowBlur = 1;
          newCtx.shadowColor = '#0000FF';
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasSignature(true);
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.beginPath();
    ctx?.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = canvasRef.current?.getContext('2d');
    ctx?.lineTo(x, y);
    ctx?.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
    onClear?.();
  };

  const save = () => {
    if (!hasSignature) {
      alert('Assinatura obrigatória para finalizar o documento');
      return;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="bg-white overflow-hidden touch-none relative border-2 border-dashed border-slate-200 rounded-2xl">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full cursor-crosshair"
        />
        <div className="absolute bottom-4 right-6 pointer-events-none">
          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Assine aqui seu nome completo</p>
        </div>
      </div>
      <div className="flex gap-3 p-4 bg-white border-t border-slate-100">
        <button
          onClick={clear}
          className="flex-1 py-4 px-4 bg-slate-50 text-slate-600 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"
        >
          Limpar
        </button>
        <button
          onClick={save}
          disabled={saving || !hasSignature}
          className={`flex-1 py-4 px-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
            saving || !hasSignature 
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
          }`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
            </>
          ) : (
            'Confirmar'
          )}
        </button>
      </div>
    </div>
  );
};
