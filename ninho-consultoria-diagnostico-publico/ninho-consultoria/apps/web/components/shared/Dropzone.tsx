"use client";

import { useState, useRef, DragEvent } from "react";
import { UploadCloud } from "lucide-react";

export default function Dropzone({
  onFiles,
  compact = false,
  disabled = false,
  label,
}: {
  onFiles: (files: FileList) => void;
  compact?: boolean;
  disabled?: boolean;
  label?: string;
}) {
  const [arrastando, setArrastando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function onDragOver(e: DragEvent) {
    e.preventDefault();
    if (!disabled) setArrastando(true);
  }

  function onDragLeave(e: DragEvent) {
    e.preventDefault();
    setArrastando(false);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setArrastando(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFiles(e.dataTransfer.files);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      onFiles(e.target.files);
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  if (compact) {
    return (
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-colors ${
          arrastando ? "bg-[#eaf1fb] text-primary border border-dashed border-primary" : "bg-[#f5f6f8] text-[#5b6270] hover:bg-[#eef0f2] border border-transparent"
        } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
      >
        <UploadCloud size={12} />
        {label ?? (arrastando ? "Solte para enviar" : "Arraste ou clique para enviar")}
        <input ref={inputRef} type="file" onChange={onInputChange} className="hidden" multiple />
      </div>
    );
  }

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 cursor-pointer transition-colors ${
        arrastando ? "border-primary bg-[#eaf1fb]" : "border-[#e4e6ea] bg-[#fafbfc] hover:border-[#d8dce2]"
      } ${disabled ? "opacity-60 pointer-events-none" : ""}`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${arrastando ? "bg-[#d8e8fb]" : "bg-white border border-[#eef0f2]"}`}>
        <UploadCloud size={20} color={arrastando ? "#004AAD" : "#9aa0ac"} />
      </div>
      <div className="text-center">
        <div className="text-[13.5px] font-medium text-[#16181d]">
          {arrastando ? "Solte os arquivos aqui" : "Arraste arquivos aqui ou clique para selecionar"}
        </div>
        <div className="text-[12px] text-[#9aa0ac] mt-0.5">{label ?? "Qualquer tipo de arquivo é aceito"}</div>
      </div>
      <input ref={inputRef} type="file" onChange={onInputChange} className="hidden" multiple />
    </div>
  );
}
