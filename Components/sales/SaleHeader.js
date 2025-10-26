import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { CheckCircle, Edit } from "lucide-react";

export default function SaleHeader({ onConfirm, initialData, isLocked }) {
  const [formData, setFormData] = useState({
    negotiation_type_id: initialData?.negotiation_type_id || "",
    client_id: initialData?.client_id || "",
  });

  const { data: negotiations = [] } = useQuery({
    queryKey: ['negotiations'],
    queryFn: () => base44.entities.NegotiationType.list(),
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: () => base44.entities.Client.filter({ active: true }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const selectedNegotiation = negotiations.find(n => n.id === formData.negotiation_type_id);
    const selectedClient = clients.find(c => c.id === formData.client_id);

    onConfirm({
      ...formData,
      negotiation_type_name: selectedNegotiation?.description,
      client_name: selectedClient?.name,
    });
  };

  if (isLocked) {
    const selectedNegotiation = negotiations.find(n => n.id === formData.negotiation_type_id);
    const selectedClient = clients.find(c => c.id === formData.client_id);

    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-green-700 font-semibold">
            <CheckCircle className="w-5 h-5" />
            Cabeçalho Confirmado
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Tipo de Negociação</p>
              <p className="font-medium text-gray-900">
                {selectedNegotiation?.description}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium text-gray-900">{selectedClient?.name}</p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="negotiation_type_id">Tipo de Negociação *</Label>
          <Select
            value={formData.negotiation_type_id}
            onValueChange={(value) => setFormData({ ...formData, negotiation_type_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {negotiations.map((neg) => (
                <SelectItem key={neg.id} value={neg.id}>
                  {neg.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="client_id">Cliente *</Label>
          <Select
            value={formData.client_id}
            onValueChange={(value) => setFormData({ ...formData, client_id: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o cliente" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id}>
                  {client.name} - {client.document}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 gap-2">
          <CheckCircle className="w-4 h-4" />
          Confirmar Cabeçalho
        </Button>
      </div>
    </form>
  );
}