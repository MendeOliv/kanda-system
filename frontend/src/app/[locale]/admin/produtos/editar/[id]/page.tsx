"use client";

import { useState } from "react";

export default function AdminEditarProdutoPage({ params }: { params: { id: string } }) {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      alert("Produto atualizado com sucesso!");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface">Editar Produto</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Gerencie as informações e visibilidade do seu item.</p>
        </div>
        <div className="flex gap-4">
          <button type="button" className="px-6 py-3 rounded-lg border-2 border-outline text-on-surface-variant font-label-md hover:bg-surface-container-low transition-all active:scale-95">
            Descartar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-8 py-3 rounded-lg bg-primary text-on-primary font-label-md shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">save</span>
            {isSaving ? "A salvar..." : "Publicar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 flex flex-col gap-gutter">
          <section className="bg-surface-container-lowest rounded-xl p-md border border-surface-container-highest">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Informações Gerais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block font-label-md text-on-surface-variant mb-2">Nome do Produto</label>
                <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface" defaultValue="Pão de Leite Artesanal (Pack 6)" />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Categoria</label>
                <select className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface">
                  <option>Padaria e Pastelaria</option>
                  <option>Frutas e Legumes</option>
                  <option>Laticínios</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Referência / SKU</label>
                <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface" defaultValue="PL-ART-0024" />
              </div>
              <div className="col-span-2">
                <label className="block font-label-md text-on-surface-variant mb-2">Descrição</label>
                <textarea className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface" rows={3} defaultValue="Pães de leite frescos, produzidos diariamente com ingredientes locais." />
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest rounded-xl p-md border border-surface-container-highest">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Preço e Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Preço de Venda</label>
                <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface" defaultValue="1250" />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Stock Atual</label>
                <input className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface" defaultValue="48" />
              </div>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2">Unidade</label>
                <select className="w-full bg-white border border-outline-variant rounded-lg px-4 py-3 font-body-md text-on-surface">
                  <option>Unidade (Un)</option>
                  <option>Quilograma (Kg)</option>
                </select>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-gutter">
          <section className="bg-surface-container-lowest rounded-xl p-md border border-surface-container-highest">
            <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Visibilidade</h3>
            <div className="space-y-4">
              {["Ativo", "Rascunho", "Esgotado"].map((status) => (
                <label key={status} className="flex items-center p-3 rounded-lg hover:bg-surface-container-low cursor-pointer transition-colors border border-transparent has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
                  <input defaultChecked={status === "Ativo"} className="w-5 h-5 text-primary focus:ring-primary border-outline-variant" name="status" type="radio" />
                  <div className="ml-4">
                    <span className="block font-label-md text-on-surface">{status}</span>
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
